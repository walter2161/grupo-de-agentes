
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const defaultUserProfile: UserProfile = {
  id: 'user-default',
  name: 'Usuário',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  bio: 'Olá! Sou um usuário do Chathy.',
  preferences: {
    theme: 'light',
    language: 'pt-BR'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};
