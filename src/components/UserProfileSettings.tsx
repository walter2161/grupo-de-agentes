
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Camera } from 'lucide-react';
import { UserProfile } from '@/types/user';
import { AvatarPicker } from './AvatarPicker';
import { CustomImageUpload } from './CustomImageUpload';

interface UserProfileSettingsProps {
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ userProfile, onSave }) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);

  const handleSave = () => {
    const updatedProfile = {
      ...profile,
      updatedAt: new Date()
    };
    onSave(updatedProfile);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Perfil do Usuário</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback className="text-lg">
              {profile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg font-montserrat">{profile.name}</h3>
            <p className="text-sm text-gray-500">{profile.bio}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <Input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Seu nome"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
              <Input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <Textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Avatar</label>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Personalizado</h4>
                  <CustomImageUpload
                    currentImage={profile.avatar}
                    onImageSelect={(avatar) => setProfile({ ...profile, avatar })}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ou escolha um avatar predefinido</h4>
                  <AvatarPicker
                    selectedAvatar={profile.avatar || ''}
                    onAvatarSelect={(avatar) => setProfile({ ...profile, avatar })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Button onClick={handleSave} className="w-full">
          Salvar Perfil
        </Button>
      </CardContent>
    </Card>
  );
};
