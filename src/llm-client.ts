/**
 * LLM Client - Integration with Zhipu AI GLM-5
 * 
 * Provides real AI inference capabilities for agents
 */

import dotenv from 'dotenv';

dotenv.config();

export interface LLMConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: LLMConfig = {}) {
    this.apiKey = config.apiKey || process.env.ZHIPU_API_KEY || '';
    this.baseUrl = config.baseUrl || 'https://open.bigmodel.cn/api/paas/v4';
    this.model = config.model || 'glm-4';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 2000;

    if (!this.apiKey) {
      console.warn('⚠️  LLM Client: No API key provided. LLM features will be disabled.');
    }
  }

  async generate(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'No API key configured'
      };
    }

    try {
      const messages: any[] = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed: ${response.status} ${errorText}`
        };
      }

      const data: any = await response.json();
      
      return {
        success: true,
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Singleton instance
let llmClient: LLMClient | null = null;

export function getLLMClient(config?: LLMConfig): LLMClient {
  if (!llmClient) {
    llmClient = new LLMClient(config);
  }
  return llmClient;
}
