
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, ArrowLeft, Users, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { groupService } from '@/services/groupService';
import { Group, GroupMessage } from '@/types/groups';
import { Agent, defaultAgents } from '@/types/agents';
import { UserProfile } from '@/types/user';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EmojiPicker } from '@/components/EmojiPicker';
import { AgentAvatar } from '@/components/AgentAvatar';
import * as Icons from 'lucide-react';

interface GroupChatProps {
  group: Group;
  onBack: () => void;
  userProfile: UserProfile;
}

export const GroupChat: React.FC<GroupChatProps> = ({ group, onBack, userProfile }) => {
  const [messages, setMessages] = useLocalStorage<GroupMessage[]>(`group-chat-${group.id}`, []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [agents] = useLocalStorage<Agent[]>('agents', defaultAgents);
  
  const groupAgents = agents.filter(agent => group.members.includes(agent.id));
  const IconComponent = Icons[group.icon as keyof typeof Icons] as React.ComponentType<any>;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensagem de boas-vindas do grupo
    if (messages.length === 0) {
      const welcomeMessage: GroupMessage = {
        id: Date.now().toString(),
        content: `Olá **${userProfile.name}**! 👋 Bem-vindo ao grupo **${group.name}**! 
        
Aqui você pode conversar com nossa equipe de especialistas: ${groupAgents.map(a => a.name).join(', ')}.

💡 **Dicas para usar o grupo:**
- Faça perguntas específicas sobre qualquer especialidade
- Use @nome para mencionar um especialista específico
- Os especialistas colaboram entre si para dar as melhores respostas

Como podemos te ajudar hoje?`,
        sender: 'agent',
        senderName: 'Sistema',
        timestamp: new Date(),
        groupId: group.id
      };
      setMessages([welcomeMessage]);
    }
  }, [group.id, messages.length, groupAgents, userProfile.name]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: GroupMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      senderName: userProfile.name,
      senderAvatar: userProfile.avatar,
      timestamp: new Date(),
      groupId: group.id
    };

    const mentions = groupService.extractMentions(inputMessage, groupAgents);
    if (mentions.length > 0) {
      userMessage.mentions = mentions;
    }

    const messagesWithUser = [...messages, userMessage];
    setMessages(messagesWithUser);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { responses } = await groupService.getGroupResponse(
        inputMessage,
        messagesWithUser,
        group,
        agents,
        mentions,
        userProfile
      );

      const agentMessages: GroupMessage[] = responses.map((response, index) => {
        const agent = agents.find(a => a.id === response.agentId);
        return {
          id: (Date.now() + index + 1).toString(),
          content: response.content,
          sender: 'agent' as const,
          senderName: agent?.name || 'Agente',
          senderAvatar: agent?.avatar,
          agentId: response.agentId,
          timestamp: new Date(),
          groupId: group.id
        };
      });

      setMessages([...messagesWithUser, ...agentMessages]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: GroupMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, houve um problema técnico. Vamos tentar novamente?',
        sender: 'agent',
        senderName: 'Sistema',
        timestamp: new Date(),
        groupId: group.id
      };
      setMessages([...messagesWithUser, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
  };

  const handleMentionClick = (agentName: string) => {
    setInputMessage(prev => prev + `@${agentName} `);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${group.color} text-white p-4 border-b`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className={`w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center`}>
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold font-montserrat">{group.name}</h2>
              <p className="text-white/90 text-sm">{groupAgents.length} especialistas online</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">{groupAgents.length}</span>
          </div>
        </div>
      </div>

      {/* Group Members */}
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Membros do Grupo</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {groupAgents.map((agent) => (
            <Badge 
              key={agent.id} 
              variant="outline" 
              className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100"
              onClick={() => handleMentionClick(agent.name)}
            >
              <AgentAvatar agent={agent} size="sm" />
              <span>{agent.name}</span>
              <AtSign className="h-3 w-3 text-gray-400" />
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              {message.senderName && (
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback className="text-xs">
                      {message.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`text-xs font-medium ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-blue-600'
                  }`}>
                    {message.senderName}
                  </span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-md max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <span className="text-xs font-medium text-gray-500">Especialistas digitando...</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-white">
        <div className="flex space-x-2 items-end">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem aqui... (use @ para mencionar especialistas)"
            className="flex-1 resize-none min-h-[40px] max-h-[120px] text-sm"
            rows={1}
          />
          <div className="flex space-x-1">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              className="px-2"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="px-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
