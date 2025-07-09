
import React from 'react';
import { Button } from '@/components/ui/button';

const availableAvatars = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b12031e4?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1619194617062-5a61b698c8d2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face'
];

interface AvatarPickerProps {
  selectedAvatar: string;
  onAvatarSelect: (avatarUrl: string) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ selectedAvatar, onAvatarSelect }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
        {availableAvatars.map((avatarUrl, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={() => onAvatarSelect(avatarUrl)}
            className={`h-16 w-16 p-0 rounded-full border-2 ${
              selectedAvatar === avatarUrl ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <img
              src={avatarUrl}
              alt={`Avatar ${index + 1}`}
              className="w-full h-full rounded-full object-cover"
            />
          </Button>
        ))}
      </div>
      
      <div className="text-sm text-gray-600">
        Clique em um avatar para selecioná-lo
      </div>
    </div>
  );
};
