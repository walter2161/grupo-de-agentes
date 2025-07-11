
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, ArrowLeft, Image, Square } from 'lucide-react';
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
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Funções de áudio
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer de gravação
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const sendAudioMessage = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob) return;

    setIsLoading(true);
    
    try {
      // Converte áudio para base64 para enviar
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Simula conversão speech-to-text (em um app real, usaria um serviço)
      const audioText = await convertSpeechToText(audioBase64);
      
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `🎤 ${audioText}`,
        sender: 'user',
        timestamp: new Date(),
        agentId: agent.id,
        audioUrl: URL.createObjectURL(audioBlob)
      };

      const messagesWithAudio = [...messages, userMessage];
      setMessages(messagesWithAudio);

      // Processa resposta do agente
      const conversationHistory: MistralMessage[] = messagesWithAudio
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content.replace('🎤 ', '') // Remove emoji do áudio
        }));

      const response = await agentService.getAgentResponse(audioText, conversationHistory, currentAgent, currentUserProfile);
      
      // Converte resposta para áudio
      const responseAudioBlob = await convertTextToSpeech(response);
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'agent',
        timestamp: new Date(),
        agentId: agent.id,
        audioUrl: responseAudioBlob ? URL.createObjectURL(responseAudioBlob) : undefined
      };

      const finalMessages = [...messagesWithAudio, agentMessage];
      setMessages(finalMessages);
      
      // Reproduz automaticamente o áudio do agente
      if (responseAudioBlob) {
        const audio = new Audio(URL.createObjectURL(responseAudioBlob));
        audio.play().catch(console.error);
      }
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, houve um problema ao processar o áudio. Tente novamente.',
        sender: 'agent',
        timestamp: new Date(),
        agentId: agent.id
      };
      const finalMessages = [...messages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  }, [messages, agent.id, currentAgent, currentUserProfile, setMessages]);

  // Simula conversão speech-to-text (substituir por serviço real)
  const convertSpeechToText = async (audioBase64: string): Promise<string> => {
    // Em um app real, enviaria para API de speech-to-text (Google, Azure, etc.)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Mensagem convertida do áudio");
      }, 1000);
    });
  };

  // Simula conversão text-to-speech (substituir por serviço real)
  const convertTextToSpeech = async (text: string): Promise<Blob | null> => {
    try {
      // Usando Web Speech API nativa do navegador
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        // Para navegadores que suportam, cria um blob de áudio
        if ('MediaRecorder' in window) {
          // Simplificado - em produção usaria serviço dedicado
          speechSynthesis.speak(utterance);
          resolve(null); // Por enquanto retorna null, mas reproduz direto
        } else {
          resolve(null);
        }
      });
    } catch (error) {
      console.error('Erro na conversão text-to-speech:', error);
      return null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Effect para processar áudio quando gravação termina
  useEffect(() => {
    if (audioBlob && !isRecording) {
      sendAudioMessage(audioBlob);
    }
  }, [audioBlob, isRecording, sendAudioMessage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

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
      <div className={`bg-gradient-to-r ${currentAgent.color} text-white p-3 border-b`}>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20 p-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <AgentAvatar agent={currentAgent} size="sm" />
          
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-medium truncate">{currentAgent.name}</h2>
            <p className="text-white/90 text-xs truncate">Online agora</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm border rounded-bl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              
              {/* Player de áudio */}
              {message.audioUrl && (
                <div className="mt-2">
                  <audio 
                    controls 
                    className="w-full max-w-64 h-8"
                    preload="metadata"
                  >
                    <source src={message.audioUrl} type="audio/webm" />
                    <source src={message.audioUrl} type="audio/wav" />
                    Seu navegador não suporta áudio.
                  </audio>
                </div>
              )}
              
              {/* Exibe imagem enviada pelo agente */}
              {message.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={message.imageUrl} 
                    alt="Imagem enviada pelo agente" 
                    className="w-full max-w-48 rounded-lg shadow-sm"
                  />
                </div>
              )}
              
              <p className={`text-xs mt-1 opacity-70 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-sm border max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Gravando... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 border-t bg-white safe-area-inset-bottom">
        <div className="flex space-x-2 items-end">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Gravando áudio..." : "Mensagem..."}
            className="flex-1 resize-none min-h-[36px] max-h-[100px] text-sm rounded-full border-gray-300 px-4 py-2"
            rows={1}
            disabled={isRecording}
          />
          <div className="flex space-x-1">
            {!isRecording && <EmojiPicker onEmojiSelect={handleEmojiSelect} />}
            
            {!isRecording && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2 h-8 w-8">
                    <Image className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs">Enviar Imagem</h4>
                    <ImageUploader
                      onImageSelect={handleImageSelect}
                      onImageSend={handleImageSend}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "ghost"}
              size="sm"
              className={`px-2 h-8 w-8 ${isRecording ? 'animate-pulse' : ''}`}
              title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            {!isRecording && (
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="px-2 h-8 w-8 bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
