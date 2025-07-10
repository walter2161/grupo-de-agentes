
import React, { useState } from 'react';
import { MessageCircle, Settings, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentPortal } from '@/components/AgentPortal';
import { AgentChat } from '@/components/AgentChat';
import { AdminPanel } from '@/components/AdminPanel';
import { GroupPortal } from '@/components/GroupPortal';
import { GroupChat } from '@/components/GroupChat';
import { Agent, defaultAgents } from '@/types/agents';
import { Group, defaultGroups } from '@/types/groups';
import { UserProfile, defaultUserProfile } from '@/types/user';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'portal' | 'chat' | 'config' | 'groups' | 'group-chat'>('portal');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [agents] = useLocalStorage<Agent[]>('agents', defaultAgents);
  const [groups] = useLocalStorage<Group[]>('groups', defaultGroups);
  const [userProfile] = useLocalStorage<UserProfile>('user-profile', defaultUserProfile);
  const { user, logout } = useAuth();

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setActiveTab('chat');
  };

  const handleBackToPortal = () => {
    setSelectedAgent(null);
    setActiveTab('portal');
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setActiveTab('group-chat');
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setActiveTab('groups');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'portal':
        return <AgentPortal onAgentSelect={handleAgentSelect} />;
      case 'chat':
        if (selectedAgent) {
          const currentAgent = agents.find(a => a.id === selectedAgent.id) || selectedAgent;
          return <AgentChat agent={currentAgent} onBack={handleBackToPortal} userProfile={userProfile} />;
        } else {
          return <AgentPortal onAgentSelect={handleAgentSelect} />;
        }
      case 'groups':
        return <GroupPortal onGroupSelect={handleGroupSelect} />;
      case 'group-chat':
        if (selectedGroup) {
          const currentGroup = groups.find(g => g.id === selectedGroup.id) || selectedGroup;
          return <GroupChat group={currentGroup} onBack={handleBackToGroups} userProfile={userProfile} />;
        } else {
          return <GroupPortal onGroupSelect={handleGroupSelect} />;
        }
      case 'config':
        return <AdminPanel />;
      default:
        return <AgentPortal onAgentSelect={handleAgentSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" 
                  alt="Chathy Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-montserrat">Chathy</h1>
                <p className="text-sm text-gray-500">Especialistas em IA para todas as suas necessidades</p>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-1">
              <Button
                variant={activeTab === 'portal' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('portal')}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Agentes</span>
              </Button>
              
              <Button
                variant={activeTab === 'groups' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('groups')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Grupos</span>
              </Button>
              
              {selectedAgent && (
                <Button
                  variant={activeTab === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              )}

              {selectedGroup && (
                <Button
                  variant={activeTab === 'group-chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('group-chat')}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Grupo</span>
                </Button>
              )}
              
              <Button
                variant={activeTab === 'config' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('config')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Config</span>
              </Button>

              {/* User info and logout */}
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {user?.name || user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${activeTab === 'chat' || activeTab === 'group-chat' ? 'h-[calc(100vh-5rem)]' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <div className={`${activeTab === 'chat' || activeTab === 'group-chat' ? 'h-full' : 'h-[calc(100vh-12rem)]'}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
