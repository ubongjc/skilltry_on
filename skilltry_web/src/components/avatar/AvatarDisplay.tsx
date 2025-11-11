'use client';

import { useMemo } from 'react';

interface AvatarProps {
  avatar: {
    skinTone: string;
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
    outfit: string;
    accessories: string[];
  };
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const SKIN_TONE_COLORS: Record<string, string> = {
  light: '#FFE0BD',
  'medium-light': '#F1C27D',
  medium: '#C68642',
  'medium-dark': '#8D5524',
  dark: '#5C4033',
};

const HAIR_COLOR_COLORS: Record<string, string> = {
  black: '#000000',
  brown: '#654321',
  blonde: '#F5DEB3',
  red: '#B22222',
  gray: '#A9A9A9',
  blue: '#4169E1',
  purple: '#9370DB',
};

const EYE_COLOR_COLORS: Record<string, string> = {
  brown: '#654321',
  blue: '#4169E1',
  green: '#228B22',
  hazel: '#8E7618',
  gray: '#708090',
};

const OUTFIT_COLORS: Record<string, { primary: string; secondary: string }> = {
  casual: { primary: '#4A90E2', secondary: '#2E5C8A' },
  business: { primary: '#2C3E50', secondary: '#34495E' },
  medical: { primary: '#27AE60', secondary: '#229954' },
  tech: { primary: '#9B59B6', secondary: '#8E44AD' },
  service: { primary: '#E74C3C', secondary: '#C0392B' },
  uniform: { primary: '#34495E', secondary: '#2C3E50' },
};

export default function AvatarDisplay({ avatar, size = 'medium', animated = false }: AvatarProps) {
  const sizeMap = {
    small: { width: 80, height: 80, scale: 0.5 },
    medium: { width: 120, height: 120, scale: 0.75 },
    large: { width: 200, height: 200, scale: 1 },
  };

  const { width, height, scale } = sizeMap[size];

  const skinColor = SKIN_TONE_COLORS[avatar.skinTone] || SKIN_TONE_COLORS.medium;
  const hairColor = HAIR_COLOR_COLORS[avatar.hairColor] || HAIR_COLOR_COLORS.brown;
  const eyeColor = EYE_COLOR_COLORS[avatar.eyeColor] || EYE_COLOR_COLORS.brown;
  const outfitColors = OUTFIT_COLORS[avatar.outfit] || OUTFIT_COLORS.casual;

  const hasGlasses = avatar.accessories.includes('glasses');
  const hasHat = avatar.accessories.includes('hat');
  const hasEarrings = avatar.accessories.includes('earrings');

  return (
    <div
      className={`inline-block ${animated ? 'animate-float' : ''}`}
      style={{ width, height }}
    >
      <svg
        viewBox="0 0 200 200"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle cx="100" cy="100" r="90" fill="url(#avatarGradient)" />
        <defs>
          <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>

        {/* Body/Outfit */}
        <ellipse cx="100" cy="160" rx="50" ry="40" fill={outfitColors.primary} />
        <rect x="75" y="120" width="50" height="60" fill={outfitColors.primary} rx="5" />
        {/* Collar */}
        <path
          d="M 85 125 Q 100 130 115 125"
          fill="none"
          stroke={outfitColors.secondary}
          strokeWidth="3"
        />

        {/* Neck */}
        <rect x="90" y="110" width="20" height="20" fill={skinColor} rx="3" />

        {/* Head */}
        <circle cx="100" cy="85" r="35" fill={skinColor} />

        {/* Ears */}
        <ellipse cx="65" cy="85" rx="8" ry="12" fill={skinColor} />
        <ellipse cx="135" cy="85" rx="8" ry="12" fill={skinColor} />

        {/* Earrings */}
        {hasEarrings && (
          <>
            <circle cx="65" cy="92" r="4" fill="#FFD700" />
            <circle cx="135" cy="92" r="4" fill="#FFD700" />
          </>
        )}

        {/* Hair */}
        {avatar.hairStyle !== 'bald' && (
          <>
            {/* Hair base */}
            <ellipse
              cx="100"
              cy="60"
              rx="40"
              ry={avatar.hairStyle === 'long' ? '45' : avatar.hairStyle === 'medium' ? '35' : '25'}
              fill={hairColor}
            />

            {avatar.hairStyle === 'curly' && (
              <>
                <circle cx="80" cy="55" r="10" fill={hairColor} />
                <circle cx="100" cy="50" r="10" fill={hairColor} />
                <circle cx="120" cy="55" r="10" fill={hairColor} />
              </>
            )}

            {avatar.hairStyle === 'long' && (
              <>
                <rect x="75" y="100" width="15" height="30" fill={hairColor} rx="7" />
                <rect x="110" y="100" width="15" height="30" fill={hairColor} rx="7" />
              </>
            )}
          </>
        )}

        {/* Hat */}
        {hasHat && (
          <>
            <ellipse cx="100" cy="50" rx="45" ry="8" fill="#2C3E50" />
            <rect x="75" y="35" width="50" height="20" fill="#34495E" rx="5" />
            <rect x="85" y="32" width="30" height="5" fill="#E74C3C" />
          </>
        )}

        {/* Eyes */}
        <ellipse cx="85" cy="85" rx="8" ry="10" fill="white" />
        <ellipse cx="115" cy="85" rx="8" ry="10" fill="white" />
        <circle cx="85" cy="87" r="5" fill={eyeColor} />
        <circle cx="115" cy="87" r="5" fill={eyeColor} />
        <circle cx="87" cy="85" r="2" fill="black" />
        <circle cx="117" cy="85" r="2" fill="black" />

        {/* Eyebrows */}
        <path
          d="M 77 75 Q 85 73 93 75"
          fill="none"
          stroke={hairColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 107 75 Q 115 73 123 75"
          fill="none"
          stroke={hairColor}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Glasses */}
        {hasGlasses && (
          <>
            <circle cx="85" cy="85" r="12" fill="none" stroke="#2C3E50" strokeWidth="2" />
            <circle cx="115" cy="85" r="12" fill="none" stroke="#2C3E50" strokeWidth="2" />
            <line x1="97" y1="85" x2="103" y2="85" stroke="#2C3E50" strokeWidth="2" />
            <line x1="73" y1="85" x2="68" y2="87" stroke="#2C3E50" strokeWidth="2" />
            <line x1="127" y1="85" x2="132" y2="87" stroke="#2C3E50" strokeWidth="2" />
          </>
        )}

        {/* Nose */}
        <path
          d="M 100 90 L 98 98 L 102 98"
          fill="none"
          stroke={skinColor}
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Smile */}
        <path
          d="M 88 105 Q 100 110 112 105"
          fill="none"
          stroke="#C0392B"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Outfit Details */}
        {avatar.outfit === 'business' && (
          <>
            <line x1="100" y1="130" x2="100" y2="180" stroke={outfitColors.secondary} strokeWidth="2" />
            <circle cx="100" cy="135" r="3" fill={outfitColors.secondary} />
            <circle cx="100" cy="145" r="3" fill={outfitColors.secondary} />
          </>
        )}

        {avatar.outfit === 'medical' && (
          <>
            <rect x="85" y="135" width="30" height="5" fill="white" rx="2" />
            <text x="100" y="140" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">
              MD
            </text>
          </>
        )}
      </svg>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
