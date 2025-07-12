const GOOGLE_AI_API_KEY = 'AIzaSyCc2AGgRn-KJX7QgA3AMvuCtNhmxvBGWj8';
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'anime' | 'photographic';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: 'standard' | 'hd';
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
  timestamp: Date;
}

export class GoogleAIImageService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GOOGLE_AI_API_KEY;
  }

  // Gera um prompt otimizado para criação de imagens usando o Mistral
  async generateOptimizedPrompt(userRequest: string, agentPersonality: string): Promise<string> {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer NfZU1cM5z0d87SRrVUjdVOfZoAGDHjTu`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em criar prompts para geração de imagens AI. Baseado na personalidade do agente "${agentPersonality}", transforme a solicitação do usuário em um prompt detalhado e específico para gerar uma imagem de alta qualidade.

Regras:
1. O prompt deve ser em inglês
2. Seja específico sobre estilo, cores, composição e detalhes
3. Inclua termos técnicos de fotografia/arte quando apropriado
4. Mantenha coerência com a personalidade do agente
5. Limite o prompt a no máximo 200 caracteres
6. Foque em elementos visuais concretos

Responda APENAS com o prompt otimizado, sem explicações.`
            },
            {
              role: 'user',
              content: `Solicitação do usuário: "${userRequest}". Personalidade do agente: "${agentPersonality}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API Mistral: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || userRequest;
    } catch (error) {
      console.error('Erro ao gerar prompt otimizado:', error);
      // Fallback para o prompt original se houver erro
      return userRequest;
    }
  }

  // Simula a geração de imagem usando Unsplash como placeholder
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      // Para demonstração, vamos usar uma API de imagens placeholder
      // Em produção, você integraria com a API real do Google AI Studio
      
      const searchTerm = this.extractKeywords(request.prompt);
      const width = this.getWidthFromAspectRatio(request.aspectRatio || '1:1');
      const height = this.getHeightFromAspectRatio(request.aspectRatio || '1:1');
      
      // Usando Unsplash como placeholder até a integração real
      const imageUrl = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerm)}`;
      
      return {
        imageUrl,
        prompt: request.prompt,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      throw new Error('Falha na geração da imagem. Tente novamente.');
    }
  }

  // Gera avatar personalizado para o usuário
  async generateUserAvatar(userDescription: string): Promise<string> {
    try {
      const optimizedPrompt = await this.generateOptimizedPrompt(
        `Create a professional avatar portrait for: ${userDescription}`,
        'Professional Avatar Generator'
      );

      const imageResponse = await this.generateImage({
        prompt: optimizedPrompt,
        style: 'photographic',
        aspectRatio: '1:1',
        quality: 'hd'
      });

      return imageResponse.imageUrl;
    } catch (error) {
      console.error('Erro ao gerar avatar:', error);
      // Fallback para avatar padrão
      return '/src/assets/default-user-avatar.png';
    }
  }

  // Métodos auxiliares
  private extractKeywords(prompt: string): string {
    // Remove palavras comuns e mantém apenas palavras-chave importantes
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = prompt.toLowerCase().split(' ');
    const keywords = words.filter(word => 
      word.length > 2 && !stopWords.includes(word)
    ).slice(0, 3); // Pega as 3 primeiras palavras-chave
    
    return keywords.join(' ') || 'abstract art';
  }

  private getWidthFromAspectRatio(aspectRatio: string): number {
    const ratioMap: { [key: string]: number } = {
      '1:1': 512,
      '16:9': 768,
      '9:16': 432,
      '4:3': 640,
      '3:4': 480
    };
    return ratioMap[aspectRatio] || 512;
  }

  private getHeightFromAspectRatio(aspectRatio: string): number {
    const ratioMap: { [key: string]: number } = {
      '1:1': 512,
      '16:9': 432,
      '9:16': 768,
      '4:3': 480,
      '3:4': 640
    };
    return ratioMap[aspectRatio] || 512;
  }
}

export const googleAIImageService = new GoogleAIImageService();