import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, handleCheckoutSuccess, handleSubscriptionUpdate, handleSubscriptionDeleted } from '@/lib/stripe';
import { logError } from '@/lib/sentry';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logError(err as Error, {
        context: 'Stripe Webhook Signature Verification',
      });
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${(err as Error).message}` },
        { status: 400 }
      );
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSuccess(session);
          console.log('✅ Checkout session completed:', session.id);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdate(subscription);
          console.log('✅ Subscription updated:', subscription.id);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(subscription);
          console.log('✅ Subscription deleted:', subscription.id);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log('✅ Payment succeeded:', invoice.id);
          // Could send email notification here
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log('⚠️ Payment failed:', invoice.id);
          // Could send email notification here
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      logError(err as Error, {
        context: 'Stripe Webhook Event Handling',
        eventType: event.type,
        eventId: event.id,
      });
      return NextResponse.json(
        { error: `Error processing event: ${(err as Error).message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logError(err as Error, {
      context: 'Stripe Webhook',
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
