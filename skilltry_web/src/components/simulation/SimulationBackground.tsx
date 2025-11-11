'use client';

import { useEffect, useState, useMemo } from 'react';

interface SimulationBackgroundProps {
  sector: string;
  animated?: boolean;
}

export default function SimulationBackground({
  sector,
  animated = true,
}: SimulationBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sector-specific background configurations
  const backgrounds = {
    Technology: {
      gradient: 'from-blue-900 via-purple-900 to-indigo-900',
      pattern: 'circuit',
      overlay: 'matrix',
      color: '#3b82f6',
    },
    Healthcare: {
      gradient: 'from-teal-900 via-cyan-900 to-blue-900',
      pattern: 'medical',
      overlay: 'heartbeat',
      color: '#0891b2',
    },
    Finance: {
      gradient: 'from-emerald-900 via-green-900 to-teal-900',
      pattern: 'finance',
      overlay: 'stocks',
      color: '#10b981',
    },
    Education: {
      gradient: 'from-amber-900 via-yellow-900 to-orange-900',
      pattern: 'education',
      overlay: 'books',
      color: '#f59e0b',
    },
    Service: {
      gradient: 'from-pink-900 via-rose-900 to-red-900',
      pattern: 'service',
      overlay: 'customer',
      color: '#ec4899',
    },
    Retail: {
      gradient: 'from-violet-900 via-purple-900 to-fuchsia-900',
      pattern: 'retail',
      overlay: 'shopping',
      color: '#a855f7',
    },
    Manufacturing: {
      gradient: 'from-slate-900 via-gray-900 to-zinc-900',
      pattern: 'manufacturing',
      overlay: 'gears',
      color: '#64748b',
    },
    Marketing: {
      gradient: 'from-orange-900 via-red-900 to-pink-900',
      pattern: 'marketing',
      overlay: 'megaphone',
      color: '#f97316',
    },
    Default: {
      gradient: 'from-slate-900 via-blue-900 to-indigo-900',
      pattern: 'default',
      overlay: 'dots',
      color: '#475569',
    },
  };

  const config = backgrounds[sector as keyof typeof backgrounds] || backgrounds.Default;

  // Memoize particle styles to prevent memory leaks and unnecessary re-renders
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map(() => ({
        width: Math.random() * 4 + 2,
        height: Math.random() * 4 + 2,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      })),
    [] // Empty dependency array - generate particles only once
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-95`}
      />

      {/* Animated Pattern Overlay */}
      {animated && mounted && (
        <>
          {/* Floating Particles - Memoized to prevent memory leaks */}
          <div className="absolute inset-0">
            {particles.map((particle, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white opacity-10"
                style={{
                  width: `${particle.width}px`,
                  height: `${particle.height}px`,
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  animation: `float ${particle.duration}s linear infinite`,
                  animationDelay: `${particle.delay}s`,
                }}
              />
            ))}
          </div>

          {/* Sector-Specific Icons */}
          <SectorIcons sector={sector} color={config.color} />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(${config.color} 1px, transparent 1px),
                linear-gradient(90deg, ${config.color} 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Radial Spotlight */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${config.color} 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-40" />

      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.1;
          }
          90% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        @keyframes slide-diagonal {
          0% {
            transform: translate(-100%, -100%);
          }
          100% {
            transform: translate(100%, 100%);
          }
        }
      `}</style>
    </div>
  );
}

function SectorIcons({ sector, color }: { sector: string; color: string }) {
  const icons = {
    Technology: (
      <>
        {/* Circuit Lines */}
        <svg
          className="absolute top-10 left-10 w-32 h-32 opacity-10 animate-pulse"
          style={{ animationDuration: '4s' }}
        >
          <circle cx="20" cy="20" r="3" fill={color} />
          <circle cx="80" cy="40" r="3" fill={color} />
          <circle cx="60" cy="80" r="3" fill={color} />
          <line x1="20" y1="20" x2="80" y2="40" stroke={color} strokeWidth="1" />
          <line x1="80" y1="40" x2="60" y2="80" stroke={color} strokeWidth="1" />
          <line x1="60" y1="80" x2="20" y2="20" stroke={color} strokeWidth="1" />
        </svg>
        <svg
          className="absolute bottom-20 right-20 w-40 h-40 opacity-10 animate-pulse"
          style={{ animationDuration: '5s' }}
        >
          <rect x="10" y="10" width="30" height="30" fill="none" stroke={color} strokeWidth="1" />
          <rect x="60" y="60" width="40" height="40" fill="none" stroke={color} strokeWidth="1" />
          <line x1="40" y1="25" x2="60" y2="80" stroke={color} strokeWidth="1" />
        </svg>
      </>
    ),
    Healthcare: (
      <>
        {/* Medical Cross */}
        <svg
          className="absolute top-20 right-32 w-24 h-24 opacity-10 animate-pulse"
          style={{ animationDuration: '3s' }}
        >
          <rect x="40" y="10" width="20" height="80" fill={color} />
          <rect x="10" y="40" width="80" height="20" fill={color} />
        </svg>
        {/* Heartbeat Line */}
        <svg
          className="absolute bottom-32 left-32 w-64 h-32 opacity-10"
        >
          <polyline
            points="0,60 40,60 50,20 60,100 70,60 250,60"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </svg>
      </>
    ),
    Finance: (
      <>
        {/* Stock Chart */}
        <svg
          className="absolute top-32 right-20 w-48 h-32 opacity-10"
        >
          <polyline
            points="0,100 50,80 100,60 150,40 200,20"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          <polyline
            points="0,120 50,110 100,90 150,100 200,80"
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.6"
          />
        </svg>
        {/* Dollar Sign */}
        <svg
          className="absolute bottom-20 left-32 w-20 h-32 opacity-10 animate-pulse"
          style={{ animationDuration: '4s' }}
        >
          <text x="0" y="80" fontSize="60" fill={color} fontWeight="bold">
            $
          </text>
        </svg>
      </>
    ),
    Education: (
      <>
        {/* Book */}
        <svg
          className="absolute top-24 left-24 w-32 h-24 opacity-10 animate-pulse"
          style={{ animationDuration: '5s' }}
        >
          <rect x="10" y="10" width="60" height="80" fill="none" stroke={color} strokeWidth="2" />
          <line x1="40" y1="10" x2="40" y2="90" stroke={color} strokeWidth="2" />
        </svg>
        {/* Graduation Cap */}
        <svg
          className="absolute bottom-32 right-24 w-32 h-32 opacity-10 animate-pulse"
          style={{ animationDuration: '4s' }}
        >
          <polygon points="64,30 20,50 64,70 108,50" fill={color} />
          <rect x="100" y="40" width="8" height="40" fill={color} />
        </svg>
      </>
    ),
    Service: (
      <>
        {/* Customer Icon */}
        <svg
          className="absolute top-20 right-40 w-24 h-24 opacity-10 animate-pulse"
          style={{ animationDuration: '3s' }}
        >
          <circle cx="50" cy="30" r="15" fill={color} />
          <path d="M 20 80 Q 50 50 80 80" fill={color} />
        </svg>
        {/* Chat Bubble */}
        <svg
          className="absolute bottom-40 left-24 w-32 h-32 opacity-10"
        >
          <rect x="10" y="20" width="80" height="60" rx="10" fill="none" stroke={color} strokeWidth="2" />
          <polygon points="40,80 30,100 50,80" fill={color} />
        </svg>
      </>
    ),
    Retail: (
      <>
        {/* Shopping Cart */}
        <svg
          className="absolute top-32 left-40 w-28 h-28 opacity-10 animate-pulse"
          style={{ animationDuration: '4s' }}
        >
          <rect x="20" y="20" width="60" height="40" fill="none" stroke={color} strokeWidth="2" />
          <circle cx="35" cy="75" r="5" fill={color} />
          <circle cx="65" cy="75" r="5" fill={color} />
          <line x1="10" y1="10" x2="20" y2="20" stroke={color} strokeWidth="2" />
        </svg>
        {/* Shopping Bag */}
        <svg
          className="absolute bottom-24 right-32 w-24 h-28 opacity-10 animate-pulse"
          style={{ animationDuration: '5s' }}
        >
          <rect x="10" y="30" width="50" height="60" fill="none" stroke={color} strokeWidth="2" />
          <path d="M 20 30 Q 35 10 50 30" fill="none" stroke={color} strokeWidth="2" />
        </svg>
      </>
    ),
    Manufacturing: (
      <>
        {/* Gear */}
        <svg
          className="absolute top-20 right-32 w-32 h-32 opacity-10 animate-spin"
          style={{ animationDuration: '20s' }}
        >
          <circle cx="64" cy="64" r="40" fill="none" stroke={color} strokeWidth="8" />
          <circle cx="64" cy="64" r="20" fill={color} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x="60"
              y="10"
              width="8"
              height="20"
              fill={color}
              transform={`rotate(${i * 45} 64 64)`}
            />
          ))}
        </svg>
        {/* Smaller Gear */}
        <svg
          className="absolute bottom-32 left-40 w-24 h-24 opacity-10 animate-spin"
          style={{ animationDuration: '15s', animationDirection: 'reverse' }}
        >
          <circle cx="48" cy="48" r="30" fill="none" stroke={color} strokeWidth="6" />
          <circle cx="48" cy="48" r="15" fill={color} />
        </svg>
      </>
    ),
    Marketing: (
      <>
        {/* Megaphone */}
        <svg
          className="absolute top-24 left-32 w-32 h-28 opacity-10 animate-pulse"
          style={{ animationDuration: '3s' }}
        >
          <polygon points="10,40 40,20 40,60" fill={color} />
          <rect x="40" y="30" width="40" height="20" fill={color} />
          <circle cx="85" cy="40" r="8" fill={color} />
        </svg>
        {/* Chart Trending Up */}
        <svg
          className="absolute bottom-32 right-24 w-40 h-32 opacity-10"
        >
          <polyline
            points="10,120 50,100 90,60 130,40 170,10"
            fill="none"
            stroke={color}
            strokeWidth="3"
          />
          <polygon points="160,10 180,10 180,30" fill={color} />
        </svg>
      </>
    ),
  };

  return icons[sector as keyof typeof icons] || null;
}
