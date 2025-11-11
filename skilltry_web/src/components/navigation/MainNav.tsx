'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  Home,
  Target,
  Trophy,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function MainNav() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show nav on auth pages
  if (
    pathname?.startsWith('/sign-in') ||
    pathname?.startsWith('/sign-up')
  ) {
    return null;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, auth: true },
    { href: '/simulations', label: 'Simulations', icon: Target, auth: false },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, auth: false },
    { href: '/profile', label: 'Profile', icon: User, auth: true },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              SkillTry-On
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              // Skip auth-required links if not signed in
              if (link.auth && !isSignedIn) return null;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                  },
                }}
              />
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                // Skip auth-required links if not signed in
                if (link.auth && !isSignedIn) return null;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                      isActive(link.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {!isSignedIn && (
                <>
                  <div className="border-t my-2" />
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
