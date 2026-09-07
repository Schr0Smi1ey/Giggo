import crypto from 'node:crypto';
import { config } from '../../config/index.js';

class MockAIProvider {
  constructor() {
    this.name = 'mock';
    this.model = 'mock-deterministic';
  }

  async chat({ messages = [] }) {
    const prompt = messages.map((message) => message.content).join('\n');
    return { content: crypto.createHash('sha256').update(prompt).digest('hex'), model: this.model, provider: this.name };
  }
}

class OpenAICompatibleProvider {
  constructor() {
    if (!config.ai.apiKey) throw new Error('AI_API_KEY is required when AI_PROVIDER=openai');
    this.name = 'openai';
    this.model = config.ai.model;
    this.baseUrl = (config.ai.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
  }

  async chat({ messages }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.ai.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.ai.apiKey}` },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2,
          max_tokens: config.ai.maxTokens,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error?.message || `AI provider responded ${response.status}`);
      return { content: data?.choices?.[0]?.message?.content || '', model: data?.model || this.model, provider: this.name };
    } finally {
      clearTimeout(timer);
    }
  }
}

let provider;
export function getAIProvider() {
  if (provider) return provider;
  provider = config.ai.provider === 'openai' ? new OpenAICompatibleProvider() : new MockAIProvider();
  return provider;
}

export function resetAIProviderForTests() {
  provider = undefined;
}
