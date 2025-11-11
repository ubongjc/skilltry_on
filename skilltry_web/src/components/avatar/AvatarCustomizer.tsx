'use client';

import { useState } from 'react';
import { Save, RefreshCw, User } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface AvatarOptions {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  outfit: string;
  accessories: string[];
  displayName?: string;
  jobTitle?: string;
}

const SKIN_TONES = [
  { value: 'light', label: 'Light', color: '#FFE0BD' },
  { value: 'medium-light', label: 'Medium Light', color: '#F1C27D' },
  { value: 'medium', label: 'Medium', color: '#C68642' },
  { value: 'medium-dark', label: 'Medium Dark', color: '#8D5524' },
  { value: 'dark', label: 'Dark', color: '#5C4033' },
];

const HAIR_STYLES = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
  { value: 'curly', label: 'Curly' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'bald', label: 'Bald' },
];

const HAIR_COLORS = [
  { value: 'black', label: 'Black', color: '#000000' },
  { value: 'brown', label: 'Brown', color: '#654321' },
  { value: 'blonde', label: 'Blonde', color: '#F5DEB3' },
  { value: 'red', label: 'Red', color: '#B22222' },
  { value: 'gray', label: 'Gray', color: '#A9A9A9' },
  { value: 'blue', label: 'Blue', color: '#4169E1' },
  { value: 'purple', label: 'Purple', color: '#9370DB' },
];

const EYE_COLORS = [
  { value: 'brown', label: 'Brown', color: '#654321' },
  { value: 'blue', label: 'Blue', color: '#4169E1' },
  { value: 'green', label: 'Green', color: '#228B22' },
  { value: 'hazel', label: 'Hazel', color: '#8E7618' },
  { value: 'gray', label: 'Gray', color: '#708090' },
];

const OUTFITS = [
  { value: 'casual', label: 'Casual', icon: '👕' },
  { value: 'business', label: 'Business', icon: '👔' },
  { value: 'medical', label: 'Medical Scrubs', icon: '🩺' },
  { value: 'tech', label: 'Tech', icon: '💻' },
  { value: 'service', label: 'Service', icon: '🍳' },
  { value: 'uniform', label: 'Uniform', icon: '👮' },
];

const ACCESSORIES = [
  { value: 'glasses', label: 'Glasses', icon: '👓' },
  { value: 'hat', label: 'Hat', icon: '🎩' },
  { value: 'earrings', label: 'Earrings', icon: '💎' },
  { value: 'watch', label: 'Watch', icon: '⌚' },
  { value: 'necklace', label: 'Necklace', icon: '📿' },
];

export default function AvatarCustomizer({
  initialAvatar,
  onSave,
  saving = false,
}: {
  initialAvatar?: Partial<AvatarOptions>;
  onSave: (avatar: AvatarOptions) => Promise<void>;
  saving?: boolean;
}) {
  const [avatar, setAvatar] = useState<AvatarOptions>({
    skinTone: initialAvatar?.skinTone || 'medium',
    hairStyle: initialAvatar?.hairStyle || 'short',
    hairColor: initialAvatar?.hairColor || 'brown',
    eyeColor: initialAvatar?.eyeColor || 'brown',
    outfit: initialAvatar?.outfit || 'casual',
    accessories: initialAvatar?.accessories || [],
    displayName: initialAvatar?.displayName,
    jobTitle: initialAvatar?.jobTitle,
  });

  const [activeTab, setActiveTab] = useState<'appearance' | 'outfit' | 'info'>('appearance');

  const updateAvatar = (field: keyof AvatarOptions, value: any) => {
    setAvatar({ ...avatar, [field]: value });
  };

  const toggleAccessory = (accessory: string) => {
    if (avatar.accessories.includes(accessory)) {
      setAvatar({
        ...avatar,
        accessories: avatar.accessories.filter((a) => a !== accessory),
      });
    } else {
      setAvatar({
        ...avatar,
        accessories: [...avatar.accessories, accessory],
      });
    }
  };

  const randomize = () => {
    setAvatar({
      skinTone: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)].value,
      hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].value,
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].value,
      eyeColor: EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].value,
      outfit: OUTFITS[Math.floor(Math.random() * OUTFITS.length)].value,
      accessories: [],
      displayName: avatar.displayName,
      jobTitle: avatar.jobTitle,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Preview */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <AvatarDisplay avatar={avatar} size="large" animated />
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {avatar.displayName || 'Your Avatar'}
            </h3>
            {avatar.jobTitle && (
              <p className="text-gray-600 mt-1">{avatar.jobTitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Customization Controls */}
      <div>
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'appearance'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('outfit')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'outfit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Outfit & Style
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Info
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {activeTab === 'appearance' && (
            <>
              {/* Skin Tone - responsive with wrapping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Skin Tone
                </label>
                <div className="flex gap-2 flex-wrap">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => updateAvatar('skinTone', tone.value)}
                      className={`w-12 h-12 rounded-full border-4 transition ${
                        avatar.skinTone === tone.value
                          ? 'border-blue-600 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: tone.color }}
                      title={tone.label}
                      aria-label={`Select ${tone.label} skin tone`}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hair Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {HAIR_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => updateAvatar('hairStyle', style.value)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                        avatar.hairStyle === style.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hair Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {HAIR_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateAvatar('hairColor', color.value)}
                      className={`w-10 h-10 rounded-full border-4 transition ${
                        avatar.hairColor === color.value
                          ? 'border-blue-600 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.color }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Eye Color - responsive with wrapping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Eye Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {EYE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateAvatar('eyeColor', color.value)}
                      className={`w-10 h-10 rounded-full border-4 transition ${
                        avatar.eyeColor === color.value
                          ? 'border-blue-600 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.color }}
                      title={color.label}
                      aria-label={`Select ${color.label} eye color`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'outfit' && (
            <>
              {/* Outfit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Outfit
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {OUTFITS.map((outfit) => (
                    <button
                      key={outfit.value}
                      onClick={() => updateAvatar('outfit', outfit.value)}
                      className={`px-4 py-4 rounded-lg border-2 font-medium transition ${
                        avatar.outfit === outfit.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{outfit.icon}</div>
                      {outfit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Accessories
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCESSORIES.map((accessory) => (
                    <button
                      key={accessory.value}
                      onClick={() => toggleAccessory(accessory.value)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                        avatar.accessories.includes(accessory.value)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{accessory.icon}</div>
                      <div className="text-xs">{accessory.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'info' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={avatar.displayName || ''}
                  onChange={(e) => updateAvatar('displayName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How you'd like to be called"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title / Aspiration
                </label>
                <input
                  type="text"
                  value={avatar.jobTitle || ''}
                  onChange={(e) => updateAvatar('jobTitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Aspiring Software Engineer"
                  maxLength={50}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  About Your Avatar
                </h4>
                <p className="text-sm text-blue-800">
                  Your avatar represents you in all simulations. You'll see yourself
                  in different work environments, facing real challenges that
                  professionals encounter every day.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={randomize}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Randomize
          </button>

          <button
            onClick={() => onSave(avatar)}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
}
