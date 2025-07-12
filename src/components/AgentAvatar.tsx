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
        <AvatarImage src="/src/assets/default-user-avatar.png" alt={agent.name} />
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