import type { ConstructedContext } from './context.ts';

export interface GenerationOutput {
  answer: string;
  model: string;
  isDemoFallback: boolean;
  latencyMs: number;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Answer Generator: Supports offline Demo Mode and optional OpenAI-compatible LLM.
 * When retrieved context is missing authoritative leave entitlement, it generates an answer
 * reflecting the missing information.
 */
export async function generateAnswer(
  query: string,
  context: ConstructedContext
): Promise<GenerationOutput> {
  const isDemoMode = process.env.DEMO_MODE !== 'false' || !process.env.OPENAI_API_KEY;
  const startTime = Date.now();

  if (isDemoMode) {
    // Deterministic generation based strictly on available context
    const hasAuthoritativeEntitlement = context.contextChunkIds.includes('chunk_004');

    let answer = '';
    if (hasAuthoritativeEntitlement) {
      answer =
        'Eligible full-time employees at Acme Corporation receive 26 weeks of fully paid parental leave following the birth, adoption, or foster placement of a child. Leave may be taken continuously or in two-week increments within 12 months.';
    } else {
      answer =
        'According to company guidelines, all parental leave requests must be formally submitted through the HR Workday portal at least 30 calendar days in advance with supporting documentation. Note: The provided context does not contain the specific policy duration or paid leave entitlement details.';
    }

    const latencyMs = Math.max(25, Date.now() - startTime);

    return {
      answer,
      model: 'demo-deterministic-llm',
      isDemoFallback: true,
      latencyMs,
      tokenUsage: {
        promptTokens: Math.round(context.promptTemplate.length / 4),
        completionTokens: Math.round(answer.length / 4),
        totalTokens: Math.round((context.promptTemplate.length + answer.length) / 4),
      },
    };
  }

  // Live LLM Provider Integration with timeout (Rule 14)
  try {
    const endpoint = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const apiKey = process.env.OPENAI_API_KEY || '';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a strict QA assistant. Answer only from the provided context. If information is missing, explicitly note what was omitted.',
          },
          { role: 'user', content: context.promptTemplate },
        ],
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LLM API responded with HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    const answer =
      data.choices?.[0]?.message?.content?.trim() ||
      'No answer could be generated from available context.';

    return {
      answer,
      model,
      isDemoFallback: false,
      latencyMs: Date.now() - startTime,
      tokenUsage: {
        promptTokens: data.usage?.prompt_tokens || Math.round(context.promptTemplate.length / 4),
        completionTokens: data.usage?.completion_tokens || Math.round(answer.length / 4),
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  } catch {
    // Graceful fallback to deterministic generator if API fails
    return {
      answer:
        'According to company guidelines, all parental leave requests must be formally submitted through the HR Workday portal at least 30 calendar days in advance with supporting documentation. Note: The provided context does not contain the specific policy duration or paid leave entitlement details.',
      model: 'demo-fallback-after-error',
      isDemoFallback: true,
      latencyMs: Date.now() - startTime,
      tokenUsage: {
        promptTokens: Math.round(context.promptTemplate.length / 4),
        completionTokens: 45,
        totalTokens: Math.round(context.promptTemplate.length / 4) + 45,
      },
    };
  }
}
