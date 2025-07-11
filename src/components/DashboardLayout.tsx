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
  UserCog,
  Lock,
  FileText,
  Trash2,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TabType = 'dashboard' | 'profile' | 'change-password' | 'agents' | 'edit-agent' | 'guidelines' | 'persona' | 'docs' | 'history' | 'protocols' | 'settings' | 'integrations' | 'delete' | 'terms' | 'logout';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: any;
  tab?: TabType;
  isExpandable?: boolean;
  children?: Array<{ id: TabType; label: string; icon: any }>;
}

const menuStructure: MenuGroup[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    tab: 'dashboard' 
  },
  { 
    id: 'profile-group', 
    label: 'Perfil', 
    icon: UserCog, 
    tab: 'profile',
    isExpandable: true,
    children: [
      { id: 'change-password', label: 'Trocar senha', icon: Lock }
    ]
  },
  { 
    id: 'agents-group', 
    label: 'Gerenciar Agentes', 
    icon: Users, 
    tab: 'agents',
    isExpandable: true,
    children: [
      { id: 'guidelines', label: 'Diretrizes', icon: BookOpen },
      { id: 'persona', label: 'Persona', icon: MessageSquare },
      { id: 'docs', label: 'Documentação', icon: FileText },
      { id: 'history', label: 'Histórico', icon: Download },
      { id: 'protocols', label: 'Protocolos', icon: Trophy }
    ]
  },
  { 
    id: 'settings-group', 
    label: 'Configurações', 
    icon: Settings, 
    tab: 'settings',
    isExpandable: true,
    children: [
      { id: 'integrations', label: 'Integrações', icon: Plug },
      { id: 'delete', label: 'Excluir', icon: Trash2 }
    ]
  },
  { 
    id: 'terms', 
    label: 'Termos e Política de privacidade', 
    icon: FileText, 
    tab: 'terms' 
  },
  { 
    id: 'logout', 
    label: 'Sair', 
    icon: LogOut, 
    tab: 'logout' 
  }
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['agents-group']);

  // Seleciona uma imagem de fundo aleatória ao carregar o componente
  useEffect(() => {
    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setBackgroundImage(randomImage);
  }, []);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleMenuClick = (tab: TabType, groupId?: string) => {
    if (groupId && menuStructure.find(g => g.id === groupId)?.isExpandable) {
      // Se é um grupo expansível, apenas alterna a expansão
      toggleGroup(groupId);
      // Só muda de aba se não for apenas para expandir
      if (tab) {
        onTabChange(tab);
      }
    } else {
      // Se não é expansível, muda de aba e fecha sidebar
      if (tab) {
        onTabChange(tab);
      }
      setSidebarOpen(false);
    }
  };

  const getCurrentPageTitle = () => {
    for (const group of menuStructure) {
      if (group.tab === activeTab) {
        return group.label;
      }
      if (group.children) {
        const child = group.children.find(child => child.id === activeTab);
        if (child) {
          return child.label;
        }
      }
    }
    return 'Painel Administrativo';
  };

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
          {menuStructure.map((group) => {
            const Icon = group.icon;
            const isMainActive = activeTab === group.tab;
            const hasActiveChild = group.children?.some(child => child.id === activeTab);
            const isGroupExpanded = expandedGroups.includes(group.id);
            
            return (
              <div key={group.id}>
                {/* Main Menu Item */}
                <button
                  onClick={() => {
                    if (group.tab) {
                      handleMenuClick(group.tab, group.id);
                    } else if (group.isExpandable) {
                      toggleGroup(group.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isMainActive || hasActiveChild
                      ? "bg-gray-800 text-white border-l-4 border-blue-500" 
                      : "text-white hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{group.label}</span>
                  </div>
                  {group.isExpandable && (
                    <div className="ml-auto">
                      {isGroupExpanded ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </div>
                  )}
                </button>

                {/* Sub Menu Items */}
                {group.children && isGroupExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {group.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = activeTab === child.id;
                      
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleMenuClick(child.id)}
                          className={cn(
                            "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isChildActive
                              ? "bg-gray-700 text-white border-l-2 border-blue-400" 
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          )}
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
                {getCurrentPageTitle()}
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