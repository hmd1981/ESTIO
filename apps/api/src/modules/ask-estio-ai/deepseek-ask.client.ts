import { Injectable, Logger } from '@nestjs/common';

export type DeepSeekChatResult = {
  content: string;
  tokensUsed?: number;
};

@Injectable()
export class DeepseekAskClient {
  private readonly log = new Logger(DeepseekAskClient.name);

  async complete(params: {
    system: string;
    user: string;
    model: string;
    baseUrl: string;
    apiKey: string;
  }): Promise<DeepSeekChatResult> {
    let base = params.baseUrl.replace(/\/$/, '');
    if (!base.endsWith('/v1')) {
      base = `${base}/v1`;
    }
    const url = `${base}/chat/completions`;
    const body = {
      model: params.model,
      messages: [
        { role: 'system', content: params.system },
        { role: 'user', content: params.user },
      ],
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      this.log.warn(`DeepSeek HTTP ${res.status} ${t.slice(0, 200)}`);
      throw new Error(`deepseek_http_${res.status}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
    };
    const content = json.choices?.[0]?.message?.content?.trim() ?? '';
    return {
      content,
      tokensUsed: json.usage?.total_tokens,
    };
  }
}
