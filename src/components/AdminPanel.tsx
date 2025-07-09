import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Settings, User, MessageSquare, Download, BookOpen, Calendar, Trophy, Plus, Edit, Trash2, UserCog } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Message, ConsultationProtocol } from '@/types';
import { Agent, defaultAgents } from '@/types/agents';
import { UserProfile, defaultUserProfile } from '@/types/user';
import { AgentAvatar } from './AgentAvatar';
import { IconPicker } from './IconPicker';
import { AvatarPicker } from './AvatarPicker';
import { CustomImageUpload } from './CustomImageUpload';
import { SpecialtySelector } from './SpecialtySelector';
import { ColorPicker } from './ColorPicker';
import { UserProfileSettings } from './UserProfileSettings';
import { generateAgentContent } from '@/utils/agentContentGenerator';

export const AdminPanel = () => {
  const [agents, setAgents] = useLocalStorage<Agent[]>('agents', defaultAgents);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('user-profile', defaultUserProfile);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages] = useLocalStorage<Message[]>('chat-history', []);
  const [protocols, setProtocols] = useLocalStorage<ConsultationProtocol[]>('consultation-protocols', []);
  const [activeTab, setActiveTab] = useState<'user' | 'agents' | 'profile' | 'guidelines' | 'persona' | 'history' | 'docs' | 'protocols'>('user');

  const handleSaveAgent = () => {
    if (!selectedAgent) return;
    
    const updatedAgents = agents.map(agent => 
      agent.id === selectedAgent.id ? selectedAgent : agent
    );
    setAgents(updatedAgents);
    alert('Agente salvo com sucesso!');
  };

  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    alert('Perfil salvo com sucesso!');
  };

  const handleCreateAgent = () => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: 'Novo Agente',
      title: 'Especialista',
      specialty: 'Psicologia Clínica',
      description: 'Descrição do novo agente',
      icon: 'User',
      color: 'from-blue-500 to-cyan-500',
      experience: '1 ano de experiência',
      approach: 'Abordagem personalizada',
      guidelines: 'Diretrizes do agente...',
      personaStyle: 'Estilo profissional',
      documentation: 'Documentação do agente',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    };
    
    setAgents([...agents, newAgent]);
    setSelectedAgent(newAgent);
    setActiveTab('profile');
  };

  const handleDeleteAgent = (agentId: string) => {
    if (confirm('Tem certeza que deseja deletar este agente?')) {
      const updatedAgents = agents.filter(agent => agent.id !== agentId);
      setAgents(updatedAgents);
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null);
      }
    }
  };

  const handleDownloadHistory = () => {
    const historyText = messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender === 'user' ? 'Usuário' : 'Agente'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([historyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createNewProtocol = () => {
    const newProtocol: ConsultationProtocol = {
      id: Date.now().toString(),
      patientName: '',
      sessionNumber: protocols.length + 1,
      date: new Date(),
      objectives: [''],
      activities: [''],
      progress: 0,
      gamificationScore: 0,
      nextSteps: [''],
      status: 'planning'
    };
    setProtocols([...protocols, newProtocol]);
  };

  const tabs = [
    { id: 'user', label: 'Usuário', icon: UserCog },
    { id: 'agents', label: 'Agentes', icon: User },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'guidelines', label: 'Diretrizes', icon: Settings },
    { id: 'persona', label: 'Persona', icon: MessageSquare },
    { id: 'history', label: 'Histórico', icon: Download },
    { id: 'docs', label: 'Documentação', icon: BookOpen },
    { id: 'protocols', label: 'Protocolos', icon: Trophy }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-montserrat">Painel Administrativo</h1>
        <p className="text-gray-600">Configure seu perfil e gerencie os agentes IA</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isDisabled = tab.id !== 'user' && tab.id !== 'agents' && tab.id !== 'history' && tab.id !== 'protocols' && !selectedAgent;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id as any)}
                  disabled={isDisabled}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : isDisabled
                      ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'user' && (
        <UserProfileSettings 
          userProfile={userProfile} 
          onSave={handleSaveUserProfile} 
        />
      )}

      {activeTab === 'agents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gerenciar Agentes</h3>
            <Button onClick={handleCreateAgent}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agente
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AgentAvatar agent={agent} size="md" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{agent.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{agent.specialty}</p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setActiveTab('profile');
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Deletar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações do Agente: {selectedAgent.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <Input
                    type="text"
                    value={selectedAgent.name}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <Input
                    type="text"
                    value={selectedAgent.title}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, title: e.target.value })}
                  />
                </div>
                
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                   <SpecialtySelector
                     selectedSpecialty={selectedAgent.specialty}
                     onSpecialtySelect={(specialty) => {
                       const generatedContent = generateAgentContent(specialty, selectedAgent);
                       setSelectedAgent({ ...selectedAgent, specialty, ...generatedContent });
                     }}
                   />
                 </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experiência</label>
                  <Input
                    type="text"
                    value={selectedAgent.experience}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, experience: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abordagem</label>
                  <Input
                    type="text"
                    value={selectedAgent.approach}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, approach: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <Textarea
                    value={selectedAgent.description}
                    onChange={(e) => setSelectedAgent({ ...selectedAgent, description: e.target.value })}
                    rows={3}
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
                        currentImage={selectedAgent.avatar}
                        onImageSelect={(avatar) => setSelectedAgent({ ...selectedAgent, avatar })}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ou escolha um avatar predefinido</h4>
                      <AvatarPicker
                        selectedAvatar={selectedAgent.avatar || ''}
                        onAvatarSelect={(avatar) => setSelectedAgent({ ...selectedAgent, avatar })}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Ícone da Profissão</label>
                  <IconPicker
                    selectedIcon={selectedAgent.icon}
                    onIconSelect={(icon) => setSelectedAgent({ ...selectedAgent, icon })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Cor do Tema</label>
                  <ColorPicker
                    selectedColor={selectedAgent.color}
                    onColorSelect={(color) => setSelectedAgent({ ...selectedAgent, color })}
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={handleSaveAgent} className="w-full">Salvar Perfil</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'guidelines' && selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Diretrizes: {selectedAgent.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instruções para o Agente IA
              </label>
              <Textarea
                value={selectedAgent.guidelines}
                onChange={(e) => setSelectedAgent({ ...selectedAgent, guidelines: e.target.value })}
                rows={12}
                className="w-full font-mono text-sm"
                placeholder="Digite as diretrizes que o AI deve seguir..."
              />
            </div>
            <Button onClick={handleSaveAgent} className="w-full">Salvar Diretrizes</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'persona' && selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Estilo da Persona: {selectedAgent.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personalidade do Agente
              </label>
              <Textarea
                value={selectedAgent.personaStyle}
                onChange={(e) => setSelectedAgent({ ...selectedAgent, personaStyle: e.target.value })}
                rows={6}
                className="w-full"
                placeholder="Descreva como o agente deve se comportar, seu tom de voz, estilo de comunicação..."
              />
            </div>
            <Button onClick={handleSaveAgent} className="w-full">Salvar Estilo</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Histórico de Mensagens</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Total de mensagens: {messages.length}
              </p>
              <p className="text-sm text-gray-600">
                Última conversa: {messages.length > 0 
                  ? new Date(messages[messages.length - 1].timestamp).toLocaleString()
                  : 'Nenhuma conversa ainda'
                }
              </p>
            </div>
            <Button onClick={handleDownloadHistory} className="w-full" disabled={messages.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Histórico (.txt)
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'docs' && selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Documentação: {selectedAgent.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base de Conhecimento
              </label>
              <Textarea
                value={selectedAgent.documentation}
                onChange={(e) => setSelectedAgent({ ...selectedAgent, documentation: e.target.value })}
                rows={10}
                className="w-full"
                placeholder="Adicione informações, técnicas e conhecimentos específicos que o agente deve ter..."
              />
            </div>
            <Button onClick={handleSaveAgent} className="w-full">Salvar Documentação</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'protocols' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Protocolos de Consulta</h3>
            <Button onClick={createNewProtocol}>
              <Trophy className="h-4 w-4 mr-2" />
              Novo Protocolo
            </Button>
          </div>
          
          <div className="grid gap-4">
            {protocols.map((protocol, index) => (
              <Card key={protocol.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Protocolo #{protocol.sessionNumber}</span>
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-normal">{protocol.gamificationScore} pts</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Paciente</label>
                    <Input
                      type="text"
                      value={protocol.patientName}
                      onChange={(e) => {
                        const updated = [...protocols];
                        updated[index] = { ...protocol, patientName: e.target.value };
                        setProtocols(updated);
                      }}
                      placeholder="Nome do paciente"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Objetivos</label>
                    <Textarea
                      value={protocol.objectives.join('\n')}
                      onChange={(e) => {
                        const updated = [...protocols];
                        updated[index] = { ...protocol, objectives: e.target.value.split('\n') };
                        setProtocols(updated);
                      }}
                      rows={3}
                      placeholder="Um objetivo por linha"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Progresso</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={protocol.progress}
                          onChange={(e) => {
                            const updated = [...protocols];
                            updated[index] = { ...protocol, progress: parseInt(e.target.value) };
                            setProtocols(updated);
                          }}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium">{protocol.progress}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={protocol.status}
                        onChange={(e) => {
                          const updated = [...protocols];
                          updated[index] = { ...protocol, status: e.target.value as any };
                          setProtocols(updated);
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="planning">Planejamento</option>
                        <option value="active">Ativo</option>
                        <option value="completed">Concluído</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {protocols.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum protocolo criado ainda</p>
                  <p className="text-sm text-gray-400">Crie seu primeiro protocolo para começar</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
