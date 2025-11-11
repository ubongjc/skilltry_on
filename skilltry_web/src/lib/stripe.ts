import Stripe from 'stripe';
import { prisma } from './prisma';
import type { SubscriptionPlan } from '@prisma/client';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export const STRIPE_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '3 simulations per month',
      'Basic feedback',
      'Community support',
    ],
    limits: {
      simulations: 3,
      features: ['basic'],
    },
  },
  INDIVIDUAL: {
    name: 'Individual',
    price: 19.99,
    priceId: process.env.STRIPE_INDIVIDUAL_PRICE_ID,
    features: [
      'Unlimited simulations',
      'AI-powered detailed feedback',
      'Training recommendations',
      'Progress tracking',
      'Priority support',
    ],
    limits: {
      simulations: Infinity,
      features: ['basic', 'ai-feedback', 'progress-tracking'],
    },
  },
  INSTITUTION: {
    name: 'Institution',
    price: 299.99,
    priceId: process.env.STRIPE_INSTITUTION_PRICE_ID,
    features: [
      'Unlimited student accounts',
      'Custom simulations',
      'Analytics dashboard',
      'White-label option',
      'Dedicated support',
      'API access',
    ],
    limits: {
      simulations: Infinity,
      students: Infinity,
      features: ['basic', 'ai-feedback', 'progress-tracking', 'analytics', 'custom-simulations', 'api-access'],
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: null, // Custom pricing
    priceId: null,
    features: [
      'Everything in Institution',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise deployment option',
    ],
    limits: {
      simulations: Infinity,
      students: Infinity,
      features: ['all'],
    },
  },
} as const;

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: SubscriptionPlan,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const planConfig = STRIPE_PLANS[plan];

  if (!planConfig.priceId) {
    throw new Error('Invalid plan or price ID not configured');
  }

  // Check if customer already exists
  let customer = await prisma.subscription.findFirst({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  let customerId = customer?.stripeCustomerId;

  if (!customerId) {
    // Create new Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    customerId = stripeCustomer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
    },
    subscription_data: {
      metadata: {
        userId,
        plan,
      },
    },
  });

  return session;
}

/**
 * Create Stripe customer portal session
 * Allows users to manage their subscription
 */
export async function createPortalSession(
  userId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
  });

  if (!subscription) {
    throw new Error('No subscription found');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Handle successful checkout
 */
export async function handleCheckoutSuccess(
  session: Stripe.Checkout.Session
): Promise<void> {
  const { userId, plan } = session.metadata as { userId: string; plan: SubscriptionPlan };

  if (!session.subscription || typeof session.subscription === 'string') {
    throw new Error('Subscription not found in session');
  }

  const subscription = session.subscription as Stripe.Subscription;

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    create: {
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      plan,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

/**
 * Handle subscription update
 */
export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription
): Promise<void> {
  await prisma.subscription.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

/**
 * Handle subscription deletion/cancellation
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  await prisma.subscription.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      status: 'canceled',
      cancelAtPeriodEnd: true,
    },
  });
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['active', 'trialing'] },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!subscription) {
    return {
      plan: 'FREE' as SubscriptionPlan,
      status: 'inactive',
      features: STRIPE_PLANS.FREE.features,
      limits: STRIPE_PLANS.FREE.limits,
    };
  }

  const planConfig = STRIPE_PLANS[subscription.plan];

  return {
    plan: subscription.plan,
    status: subscription.status,
    features: planConfig.features,
    limits: planConfig.limits,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

/**
 * Check if user has access to a feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: string
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (subscription.limits.features.includes('all')) {
    return true;
  }

  return subscription.limits.features.includes(feature);
}

/**
 * Check if user can create more attempts this month
 */
export async function canCreateAttempt(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (subscription.limits.simulations === Infinity) {
    return true;
  }

  // Count attempts this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const attemptsThisMonth = await prisma.attempt.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  return attemptsThisMonth < subscription.limits.simulations;
}

/**
 * Get usage statistics for current billing period
 */
export async function getUsageStats(userId: string) {
  const subscription = await getUserSubscription(userId);

  let startDate = new Date();
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  if (subscription.currentPeriodEnd) {
    const daysInPeriod = 30;
    startDate = new Date(subscription.currentPeriodEnd);
    startDate.setDate(startDate.getDate() - daysInPeriod);
  }

  const [attemptsCount, completedCount] = await Promise.all([
    prisma.attempt.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    }),
    prisma.attempt.count({
      where: {
        userId,
        createdAt: { gte: startDate },
        status: 'COMPLETED',
      },
    }),
  ]);

  return {
    attemptsUsed: attemptsCount,
    attemptsLimit: subscription.limits.simulations,
    completedAttempts: completedCount,
    periodStart: startDate,
    periodEnd: subscription.currentPeriodEnd || null,
  };
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
  });

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: true },
  });
}

/**
 * Reactivate cancelled subscription
 */
export async function reactivateSubscription(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, cancelAtPeriodEnd: true },
  });

  if (!subscription) {
    throw new Error('No subscription to reactivate');
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { cancelAtPeriodEnd: false },
  });
}
