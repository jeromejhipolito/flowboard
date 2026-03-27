import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Anthropic | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  async parseTask(input: string, members?: { id: string; firstName: string; lastName: string }[], labels?: { id: string; name: string }[]) {
    if (!this.client) {
      this.logger.warn('AI features disabled: no ANTHROPIC_API_KEY');
      return null;
    }

    const memberContext = members?.length
      ? `Available team members (use their exact id): ${members.map(m => `${m.firstName} ${m.lastName} (id: ${m.id})`).join(', ')}`
      : 'No team members available.';

    const labelContext = labels?.length
      ? `Available labels (use their exact id): ${labels.map(l => `${l.name} (id: ${l.id})`).join(', ')}`
      : 'No labels available.';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: `You are a task parser. Extract structured task data from natural language input. Return ONLY valid JSON with these fields: title (string), priority (one of: LOW, MEDIUM, HIGH, URGENT), assigneeId (string id from members list or null), dueDate (ISO date string or null), labelIds (array of label ids or empty array). ${memberContext} ${labelContext}`,
        messages: [{ role: 'user', content: input }],
      }, { signal: controller.signal });

      clearTimeout(timeout);

      const text = response.content[0]?.type === 'text' ? response.content[0].text : null;
      if (!text) return null;

      // Parse JSON from response (may be wrapped in markdown code block)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || input.slice(0, 200),
        priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(parsed.priority) ? parsed.priority : 'MEDIUM',
        assigneeId: members?.find(m => m.id === parsed.assigneeId) ? parsed.assigneeId : null,
        dueDate: parsed.dueDate || null,
        labelIds: Array.isArray(parsed.labelIds) ? parsed.labelIds.filter((id: string) => labels?.some(l => l.id === id)) : [],
      };
    } catch (error) {
      this.logger.error(`AI parse failed: ${error.message}`);
      return null;
    }
  }

  async enrichTask(task: { id: string; title: string; description?: string; priority: string }, labels: { id: string; name: string }[]) {
    if (!this.client) return null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 128,
        system: `You are a task analyzer. Given a task title and description, suggest: 1) a priority level (LOW/MEDIUM/HIGH/URGENT), 2) up to 3 relevant label ids. Available labels: ${labels.map(l => `${l.name} (id: ${l.id})`).join(', ')}. Return ONLY JSON: { "suggestedPriority": "...", "suggestedLabelIds": ["..."] }`,
        messages: [{ role: 'user', content: `Title: ${task.title}\nDescription: ${task.description || 'No description'}` }],
      }, { signal: controller.signal });

      clearTimeout(timeout);

      const text = response.content[0]?.type === 'text' ? response.content[0].text : null;
      if (!text) return null;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error(`AI enrich failed: ${error.message}`);
      return null;
    }
  }
}
