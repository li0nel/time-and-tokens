import type { Block, ChatMessage } from '../types/blocks'

/** Generate a simple unique ID without external dependencies. */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

/** Create a user ChatMessage from plain text. */
export function createUserMessage(id: string, content: string): ChatMessage {
  return {
    id,
    role: 'user',
    content,
    timestamp: new Date(),
  }
}

/**
 * Create an assistant ChatMessage from a blocks array.
 * Derives the plain-text `content` field by concatenating all TextBlock content.
 */
export function createAssistantMessage(
  id: string,
  blocks: Block[],
): ChatMessage {
  const content = blocks
    .filter((b) => b.type === 'text')
    .map((b) => (b.type === 'text' ? b.data.content : ''))
    .join('\n')

  return {
    id,
    role: 'assistant',
    content,
    blocks,
    timestamp: new Date(),
  }
}
