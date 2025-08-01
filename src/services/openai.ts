interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenAIService {
  private config: OpenAIConfig;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || '2000'),
      temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || '0.7'),
    };
  }

  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('Chave da API OpenAI não configurada. Verifique a variável VITE_OPENAI_API_KEY.');
    }
  }

  async generatePrediction(
    driversData: any[],
    constructorsData: any[],
    raceResults: any[]
  ): Promise<string> {
    this.validateConfig();

    try {
      // Preparar dados para análise
      const top10Drivers = driversData.slice(0, 10);
      const constructors = constructorsData.slice(0, 10);
      
      // Criar prompt contextualizado
      const systemPrompt = `Você é um especialista em análise de dados de Fórmula 1 com décadas de experiência. 
      Sua tarefa é analisar os dados da temporada atual e fazer previsões baseadas em estatísticas, tendências e desempenho.`;

      const userPrompt = `
      Analise os dados da temporada 2025 de Fórmula 1 e faça uma previsão detalhada sobre como o campeonato pode terminar.

      DADOS ATUAIS:

      **TOP 10 PILOTOS:**
      ${top10Drivers.map((driver, index) => 
        `${index + 1}. ${driver.Driver.givenName} ${driver.Driver.familyName} (${driver.Constructors[0].name}) - ${driver.points} pontos (${driver.wins} vitórias)`
      ).join('\n')}

      **CLASSIFICAÇÃO CONSTRUTORES:**
      ${constructors.map((constructor, index) => 
        `${index + 1}. ${constructor.Constructor.name} - ${constructor.points} pontos (${constructor.wins} vitórias)`
      ).join('\n')}

      **CORRIDAS REALIZADAS:** ${raceResults.length} de 24 corridas da temporada

      Com base nesses dados, forneça:

      1. **ANÁLISE DO CAMPEONATO DE PILOTOS:**
         - Quem tem mais chances de ser campeão mundial?
         - Análise dos principais candidatos
         - Pontos-chave que podem influenciar o resultado

      2. **ANÁLISE DO CAMPEONATO DE CONSTRUTORES:**
         - Qual equipe tem mais chances de vencer?
         - Análise das performances das equipes
         - Fatores técnicos e estratégicos relevantes

      3. **PREVISÕES FINAIS:**
         - Posições finais esperadas do top 5 pilotos
         - Posições finais esperadas do top 3 construtores
         - Cenários possíveis para o final da temporada

      4. **FATORES DECISIVOS:**
         - Quais elementos podem ser determinantes?
         - Corridas-chave restantes
         - Possíveis mudanças no panorama

      Seja específico, use os dados fornecidos e mantenha uma análise realista baseada nas tendências atuais.
      `;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro da API OpenAI: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Nenhuma resposta recebida da API OpenAI');
      }

      return data.choices[0].message.content;

    } catch (error) {
      console.error('Erro ao gerar previsão:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error('Chave da API OpenAI inválida ou não configurada.');
        }
        if (error.message.includes('quota')) {
          throw new Error('Cota da API OpenAI excedida. Verifique seus créditos.');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('Limite de taxa da API excedido. Tente novamente em alguns minutos.');
        }
      }
      
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  getUsageInfo(): OpenAIConfig {
    return { ...this.config, apiKey: this.config.apiKey ? '***' : '' };
  }
}

export const openAIService = new OpenAIService();
export type { OpenAIConfig, ChatMessage };
