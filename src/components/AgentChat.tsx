
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, ArrowLeft, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { agentService, MistralMessage } from '@/services/agentService';
import { Agent } from '@/types/agents';
import { ChatMessage } from '@/types/agents';
import { UserProfile } from '@/types/user';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EmojiPicker } from '@/components/EmojiPicker';
import { AgentAvatar } from '@/components/AgentAvatar';
import { ImageUploader } from '@/components/ImageUploader';
import { defaultAgents } from '@/types/agents';
import { defaultUserProfile } from '@/types/user';
import * as Icons from 'lucide-react';

interface AgentChatProps {
  agent: Agent;
  onBack: () => void;
  userProfile: UserProfile;
}

export const AgentChat: React.FC<AgentChatProps> = ({ agent, onBack, userProfile }) => {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(`chat-history-${agent.id}`, []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Carrega as informações atualizadas do agente e do usuário do localStorage
  const [agents] = useLocalStorage<Agent[]>('agents', defaultAgents);
  const [currentUserProfile] = useLocalStorage<UserProfile>('user-profile', defaultUserProfile);
  const currentAgent = agents.find(a => a.id === agent.id) || agent;

  const IconComponent = Icons[agent.icon as keyof typeof Icons] as React.ComponentType<any>;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('Messages updated:', messages.length, messages);
  }, [messages]);

  useEffect(() => {
    // Inicia a conversa se não houver mensagens
    if (messages.length === 0) {
      console.log('Initializing welcome message for agent:', agent.id);
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Olá ${currentUserProfile.name}! 😊 Sou ${currentAgent.name}, ${currentAgent.title}. ${currentAgent.description}. Como posso te ajudar hoje?`,
        sender: 'agent',
        timestamp: new Date(),
        agentId: currentAgent.id
      };
      setMessages([welcomeMessage]);
    }
  }, [agent.id, currentAgent.name, currentAgent.title, currentAgent.description, messages.length, setMessages, currentUserProfile.name]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    console.log('Sending message:', inputMessage);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      agentId: agent.id
    };

    // Primeiro, adiciona a mensagem do usuário
    console.log('Adding user message to chat:', userMessage);
    const messagesWithUser = [...messages, userMessage];
    setMessages(messagesWithUser);
    
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory: MistralMessage[] = messagesWithUser
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      const response = await agentService.getAgentResponse(inputMessage, conversationHistory, currentAgent, currentUserProfile);
      
      // Processa resposta para verificar se contém imagem
      let finalContent = response;
      let imageUrl = null;
      
      const imageMatch = response.match(/\[IMAGEM_ENVIADA:([^\]]+)\]/);
      if (imageMatch) {
        imageUrl = imageMatch[1];
        finalContent = response.replace(imageMatch[0], '').trim();
      }

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: finalContent,
        sender: 'agent',
        timestamp: new Date(),
        agentId: agent.id,
        imageUrl: imageUrl || undefined
      };

      console.log('Adding agent response:', agentMessage);
      // Agora adiciona a resposta do agente
      const finalMessages = [...messagesWithUser, agentMessage];
      console.log('Final messages array:', finalMessages);
      setMessages(finalMessages);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, houve um problema técnico. Vamos tentar novamente?',
        sender: 'agent',
        timestamp: new Date(),
        agentId: agent.id
      };
      const finalMessages = [...messagesWithUser, errorMessage];
      setMessages(finalMessages);
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

  const handleImageSelect = (imageUrl: string) => {
    // Preview da imagem selecionada
    console.log('Imagem selecionada:', imageUrl);
  };

  const handleImageSend = async (imageUrl: string, description?: string) => {
    const imageMessage: ChatMessage = {
      id: Date.now().toString(),
      content: description ? `[Imagem enviada: ${description}]` : '[Imagem enviada]',
      sender: 'user',
      timestamp: new Date(),
      agentId: agent.id
    };

    const messagesWithImage = [...messages, imageMessage];
    setMessages(messagesWithImage);
    setIsLoading(true);

    try {
      const conversationHistory: MistralMessage[] = messagesWithImage
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      const prompt = description 
        ? `O usuário enviou uma imagem com a descrição: "${description}". Por favor, analise e comente sobre a imagem baseado na descrição fornecida.`
        : 'O usuário enviou uma imagem. Por favor, reconheça o envio e pergunte se ele gostaria de descrever a imagem ou se precisa de alguma análise específica.';

      const response = await agentService.getAgentResponse(prompt, conversationHistory, currentAgent, currentUserProfile);
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'agent',
        timestamp: new Date(),
        agentId: agent.id
      };

      const finalMessages = [...messagesWithImage, agentMessage];
      setMessages(finalMessages);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, tive dificuldades para processar a imagem. Você pode tentar novamente?',
        sender: 'agent',
        timestamp: new Date(),
        agentId: agent.id
      };
      const finalMessages = [...messagesWithImage, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Rendering chat with', messages.length, 'messages');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentAgent.color} text-white p-4 border-b`}>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <AgentAvatar agent={currentAgent} size="md" />
          
          <div>
            <h2 className="text-lg font-semibold">{currentAgent.name}</h2>
            <p className="text-white/90 text-sm">{currentAgent.title} • Online agora</p>
          </div>
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
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Exibe imagem enviada pelo agente */}
              {message.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={message.imageUrl} 
                    alt="Imagem enviada pelo agente" 
                    className="w-full max-w-sm rounded-lg shadow-sm"
                  />
                </div>
              )}
              
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
            placeholder="Digite sua mensagem aqui..."
            className="flex-1 resize-none min-h-[40px] max-h-[120px] text-sm"
            rows={1}
          />
          <div className="flex space-x-1">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <Image className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Enviar Imagem</h4>
                  <ImageUploader
                    onImageSelect={handleImageSelect}
                    onImageSend={handleImageSend}
                  />
                </div>
              </PopoverContent>
            </Popover>
            
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
