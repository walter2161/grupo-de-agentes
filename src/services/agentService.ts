
import { Agent } from '@/types/agents';
import { UserProfile } from '@/types/user';
import { googleAIImageService } from './googleAIImageService';

export interface MistralMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class AgentService {
  private apiKey = 'UEPqczZDK2ldyBmVYCJHJjIPZstU3WaJ';
  private baseUrl = 'https://api.mistral.ai/v1/chat/completions';

  async getAgentResponse(
    message: string, 
    conversationHistory: MistralMessage[], 
    agent: Agent,
    userProfile?: UserProfile,
    agentContext?: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Chave da API Mistral não configurada');
    }

    const userInfo = userProfile ? `
INFORMAÇÕES DO USUÁRIO QUE VOCÊ ESTÁ ATENDENDO:
Nome: ${userProfile.name}
Bio: ${userProfile.bio || 'Não informado'}
Email: ${userProfile.email || 'Não informado'}
Adapte sua comunicação ao perfil do usuário e trate-o pelo nome sempre que apropriado.
` : '';

    const contextInfo = agentContext ? `
CONTEXTO DA SUA SALA VIRTUAL E MEMÓRIA:
${agentContext}
` : '';

    const systemPrompt = `Você é ${agent.name}, ${agent.title}.

${userInfo}

${contextInfo}

SUA ESPECIALIDADE: ${agent.specialty}
SUA EXPERIÊNCIA: ${agent.experience}
SUA ABORDAGEM: ${agent.approach}
SUA DESCRIÇÃO: ${agent.description}

DIRETRIZES IMPORTANTES:
${agent.guidelines}

ESTILO DE PERSONALIDADE:
${agent.personaStyle}

CONHECIMENTO ESPECÍFICO:
${agent.documentation}

CAPACIDADES ESPECIAIS DE IMAGEM:
- Você TEM ACESSO a um sistema de geração de imagens com IA integrado do Google AI Studio
- Quando o usuário pedir uma imagem criativa/personalizada, use: [GERAR_IMAGEM: descrição detalhada da imagem]
- Para enviar imagens, use: [ENVIAR_IMAGEM: descrição da imagem]
- Ambos os comandos agora geram imagens usando IA, não buscam imagens existentes
- Exemplos: [GERAR_IMAGEM: retrato futurista de um robô] ou [ENVIAR_IMAGEM: Homer Simpson]
- Use GERAR_IMAGEM para criações artísticas únicas e ENVIAR_IMAGEM para representações fotográficas

INFORMAÇÕES TEMPORAIS:
- Você tem conhecimento da data e hora atual: ${new Date().toLocaleString('pt-BR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
})}
- Use essas informações quando relevante para a conversa

LIMITAÇÕES DE RESPOSTA:
- Mantenha suas respostas com no máximo 800 caracteres
- Se precisar de mais espaço, seja conciso e vá direto ao ponto
- Divida respostas longas em partes menores se necessário
- O sistema irá buscar automaticamente uma imagem relevante baseada na sua descrição
- SEMPRE use este formato quando o usuário solicitar uma imagem específica
- Seja específico na descrição para obter melhores resultados

INSTRUÇÕES:
1. Responda sempre como ${agent.name}
2. Use seu conhecimento especializado em ${agent.specialty}
3. Mantenha o tom profissional, mas acolhedor
4. Se o usuário tiver nome, use-o na conversa de forma natural
5. Seja empático e compreensivo
6. Forneça respostas práticas e úteis
7. QUANDO solicitado uma imagem, use o formato [GERAR_IMAGEM: descrição] ou [ENVIAR_IMAGEM: descrição]
8. Se não souber algo específico, seja honesto sobre suas limitações

Responda de forma natural e profissional:`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      let responseContent = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
      
      // Processa comandos de geração de imagem com IA
      const generateImageMatch = responseContent.match(/\[GERAR_IMAGEM:\s*([^\]]+)\]/);
      if (generateImageMatch) {
        const imageDescription = generateImageMatch[1].trim();
        try {
          const optimizedPrompt = await googleAIImageService.generateOptimizedPrompt(
            imageDescription, 
            `${agent.name} - ${agent.specialty}`
          );
          
          const imageResponse = await googleAIImageService.generateImage({
            prompt: optimizedPrompt,
            style: 'artistic',
            aspectRatio: '1:1',
            quality: 'hd'
          });
          
          // Remove o comando da resposta e adiciona a imagem gerada
          responseContent = responseContent.replace(generateImageMatch[0], '').trim();
          responseContent += `\n\n[IMAGEM_GERADA:${imageResponse.imageUrl}]`;
        } catch (error) {
          console.error('Erro ao gerar imagem:', error);
          responseContent = responseContent.replace(generateImageMatch[0], 'Desculpe, não consegui gerar a imagem solicitada no momento.').trim();
        }
      }
      
      // Processa comandos de busca de imagem existente - agora também usa Google AI
      const searchImageMatch = responseContent.match(/\[ENVIAR_IMAGEM:\s*([^\]]+)\]/);
      if (searchImageMatch) {
        const imageDescription = searchImageMatch[1].trim();
        try {
          const optimizedPrompt = await googleAIImageService.generateOptimizedPrompt(
            imageDescription, 
            `${agent.name} - ${agent.specialty}`
          );
          
          const imageResponse = await googleAIImageService.generateImage({
            prompt: optimizedPrompt,
            style: 'photographic',
            aspectRatio: '16:9',
            quality: 'hd'
          });
          
          responseContent = responseContent.replace(searchImageMatch[0], '').trim();
          responseContent += `\n\n[IMAGEM_ENVIADA:${imageResponse.imageUrl}]`;
        } catch (error) {
          console.error('Erro ao gerar imagem:', error);
          responseContent = responseContent.replace(searchImageMatch[0], 'Desculpe, não consegui gerar a imagem solicitada no momento.').trim();
        }
      }
      
      return responseContent;
    } catch (error) {
      console.error('Erro ao chamar a API Mistral:', error);
      throw error;
    }
  }
}

export const agentService = new AgentService();
