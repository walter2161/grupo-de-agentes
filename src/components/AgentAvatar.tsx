import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import * as Icons from 'lucide-react';

interface AgentAvatarProps {
  agent: {
    name: string;
    icon: string;
    color: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const getAvatarUrl = (name: string) => {
  // Mapeamento especial para avatares customizados
  const customAvatarMap: { [key: string]: string } = {
    'Ana Silva': '/lovable-uploads/4ee7d20b-937b-4c10-a8a0-d58775e7a74b.png', // Olivia
    'Simpsom': '/lovable-uploads/395899f9-2985-465e-838d-f1d9ebe9a467.png', // Simpsom
    'Prof. Roberto': '/lovable-uploads/a4e872f4-a3bd-4d06-9fe1-372c967164e8.png', // Einstein
    'Olivia Palito': '/lovable-uploads/e6a8a37e-369d-4090-a807-67133f49df69.png', // Nova Olivia
    'Albert Einstein': '/lovable-uploads/a601652b-ab04-4bb4-bef6-bd6f35f34d56.png', // Einstein divertido
    'Walter White': '/lovable-uploads/23193c5f-0a8e-47bd-96fd-1f29f9394ab5.png', // Walter White
    'She-Ra': '/lovable-uploads/f2db29b9-d93f-41e5-9b90-19b9ae496d5c.png', // She-Ra
  };

  // Se há um avatar customizado específico, usa ele
  if (customAvatarMap[name]) {
    return customAvatarMap[name];
  }

  // Caso contrário, usa fotos do Unsplash para outros agentes
  const avatarMap: { [key: string]: string } = {
    'Carlos Mendes': 'photo-1507003211169-0a1dd7228f2d', 
    'Beatriz Costa': 'photo-1438761681033-6461ffad8d80',
    'Rafael Oliveira': 'photo-1472099645785-5658abf4ff4e',
    'Marina Santos': 'photo-1544005313-94ddf0286df2',
    'José Silva': 'photo-1500648767791-00dcc994a43e',
    'Dra. Fernanda Lima': 'photo-1573496359142-b8d87734a5a2',
    'Dr. Paulo': 'photo-1612349317150-e413f6a5b16d',
    'Prof. Ana Carla': 'photo-1580489944761-15a19d654956',
  };

  const photoId = avatarMap[name] || 'photo-1494790108755-2616b612b5bc';
  return `https://images.unsplash.com/${photoId}?w=150&h=150&fit=crop&crop=face`;
};

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ agent, size = 'lg' }) => {
  const IconComponent = Icons[agent.icon as keyof typeof Icons] as React.ComponentType<any>;
  
  const sizeClasses = {
    sm: { avatar: 'w-12 h-12', icon: 'w-6 h-6', iconContainer: 'w-5 h-5', iconSize: 'h-3 w-3' },
    md: { avatar: 'w-16 h-16', icon: 'w-8 h-8', iconContainer: 'w-6 h-6', iconSize: 'h-4 w-4' },
    lg: { avatar: 'w-20 h-20', icon: 'w-10 h-10', iconContainer: 'w-8 h-8', iconSize: 'h-5 w-5' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="relative inline-block">
      <Avatar className={sizes.avatar}>
        <AvatarImage src={agent.avatar || getAvatarUrl(agent.name)} alt={agent.name} />
        <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
          {agent.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      
      {/* Ícone da profissão sobreposto */}
      <div className={`absolute -bottom-1 -right-1 ${sizes.iconContainer} rounded-full bg-gradient-to-r ${agent.color} flex items-center justify-center border-2 border-white shadow-sm`}>
        {IconComponent && <IconComponent className={`${sizes.iconSize} text-white`} />}
      </div>
    </div>
  );
};