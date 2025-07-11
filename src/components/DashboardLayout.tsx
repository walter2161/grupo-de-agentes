import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Settings, 
  User, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Trophy, 
  Download,
  Menu,
  X,
  UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TabType = 'dashboard' | 'user' | 'agents' | 'profile' | 'guidelines' | 'persona' | 'history' | 'docs' | 'protocols';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const sidebarItems: Array<{ id: TabType; label: string; icon: any }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'user', label: 'Perfil Usuário', icon: UserCog },
  { id: 'agents', label: 'Gerenciar Agentes', icon: User },
  { id: 'profile', label: 'Editar Agente', icon: Settings },
  { id: 'guidelines', label: 'Diretrizes', icon: BookOpen },
  { id: 'persona', label: 'Persona', icon: MessageSquare },
  { id: 'history', label: 'Histórico', icon: Download },
  { id: 'docs', label: 'Documentação', icon: BookOpen },
  { id: 'protocols', label: 'Protocolos', icon: Trophy },
];

// Lista de imagens de fundo randômicas
const backgroundImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=landscape',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&h=1080&fit=crop&crop=landscape',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=landscape',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&crop=landscape',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop&crop=landscape',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=landscape',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop&crop=landscape',
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');

  // Seleciona uma imagem de fundo aleatória ao carregar o componente
  useEffect(() => {
    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setBackgroundImage(randomImage);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Imagem de fundo como marca d'água */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-[0.03] pointer-events-none z-0"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          filter: 'grayscale(100%)'
        }}
      />
      
      {/* Overlay para mobile quando sidebar está aberta */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 bg-black border-r border-gray-800 transform transition-transform duration-300 ease-in-out z-30",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-800 bg-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" 
                  alt="Chathy Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-bold text-white font-montserrat">
                Chathy Admin
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-gray-800 text-white border-l-4 border-blue-500" 
                    : "text-white hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen relative z-10">
        {/* Top Bar */}
        <header className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Painel Administrativo'}
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};