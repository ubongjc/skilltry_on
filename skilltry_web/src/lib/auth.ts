import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';
import type { User as ClerkUser } from '@clerk/nextjs/server';

export type UserRole = 'USER' | 'ADMIN' | 'INSTITUTION';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  clerkId: string;
}

/**
 * Get authenticated user with role information
 * Syncs Clerk user with database
 */
export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();

  if (!clerkUser || !clerkUser.emailAddresses[0]) {
    return null;
  }

  const email = clerkUser.emailAddresses[0].emailAddress;

  // Sync user with database
  let dbUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!dbUser) {
    // Create user in database
    dbUser = await prisma.user.create({
      data: {
        email,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || undefined,
        role: 'USER',
        lastLoginAt: new Date(),
      },
    });
  } else {
    // Update last login
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { lastLoginAt: new Date() },
    });
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name || undefined,
    role: dbUser.role as UserRole,
    clerkId: userId,
  };
}

/**
 * Require authentication
 * Throws error if user is not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require specific role
 * Throws error if user doesn't have required role
 */
export async function requireRole(
  role: UserRole | UserRole[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  const roles = Array.isArray(role) ? role : [role];

  if (!roles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole('ADMIN');
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  try {
    const user = await getAuthUser();
    if (!user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  } catch {
    return false;
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('ADMIN');
}

/**
 * Check if user owns resource
 */
export async function ownsResource(
  resourceUserId: string
): Promise<boolean> {
  const user = await getAuthUser();

  if (!user) return false;

  // Admins can access all resources
  if (user.role === 'ADMIN') return true;

  // Check if user owns the resource
  return user.id === resourceUserId;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<void> {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  const [attemptsCount, completedCount, avgScore] = await Promise.all([
    prisma.attempt.count({
      where: { userId },
    }),
    prisma.attempt.count({
      where: { userId, status: 'COMPLETED' },
    }),
    prisma.attempt.aggregate({
      where: { userId, status: 'COMPLETED' },
      _avg: { overallScore: true },
    }),
  ]);

  return {
    totalAttempts: attemptsCount,
    completedAttempts: completedCount,
    averageScore: avgScore._avg.overallScore || 0,
    completionRate: attemptsCount > 0
      ? (completedCount / attemptsCount) * 100
      : 0,
  };
}

/**
 * Delete user account (GDPR)
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const requestingUser = await getAuthUser();

  // Only allow user to delete their own account or admin
  if (
    !requestingUser ||
    (requestingUser.id !== userId && requestingUser.role !== 'ADMIN')
  ) {
    throw new Error('Forbidden');
  }

  // Soft delete - set deletedAt timestamp
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  // Note: Clerk user should be deleted separately via Clerk API
}

/**
 * Export user data (GDPR)
 */
export async function exportUserData(userId: string) {
  const requestingUser = await getAuthUser();

  // Only allow user to export their own data or admin
  if (
    !requestingUser ||
    (requestingUser.id !== userId && requestingUser.role !== 'ADMIN')
  ) {
    throw new Error('Forbidden');
  }

  const [user, attempts, subscriptions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { credentials: true },
    }),
    prisma.attempt.findMany({
      where: { userId },
      include: { simulation: true },
    }),
    prisma.subscription.findMany({
      where: { userId },
    }),
  ]);

  return {
    user: {
      ...user,
      credentials: user?.credentials.map(c => ({
        id: c.id,
        deviceType: c.deviceType,
        backedUp: c.backedUp,
        createdAt: c.createdAt,
        lastUsedAt: c.lastUsedAt,
        // Exclude sensitive data like publicKey
      })),
    },
    attempts,
    subscriptions,
    exportedAt: new Date().toISOString(),
  };
}
