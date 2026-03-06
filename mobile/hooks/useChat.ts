import { useCallback, useState } from 'react'
import type { Block, ChatMessage } from '../types/blocks'
import { createUserMessage, createAssistantMessage, generateId } from '../utils/chat'

// ---------------------------------------------------------------------------
// Hardcoded mock messages for initial development / testing
// ---------------------------------------------------------------------------

const MOCK_BLOCKS_WELCOME: Block[] = [
  {
    type: 'text',
    data: {
      content:
        'Welcome to **Mise**! I\'m your AI cooking companion. Ask me about recipes, ingredients, or techniques.',
    },
  },
  {
    type: 'quick_replies',
    data: {
      replies: [
        'Show me a quick dinner idea',
        'What can I make with chicken?',
        'Suggest a vegetarian meal',
      ],
    },
  },
]

const MOCK_BLOCKS_RECIPE: Block[] = [
  {
    type: 'text',
    data: {
      content: 'Here\'s a classic recipe that uses simple pantry ingredients:',
    },
  },
  {
    type: 'recipe_card',
    data: {
      recipeId: 'lemon-herb-chicken-001',
      title: 'Roasted Lemon Herb Chicken',
      description:
        'A simple yet elegant one-pan roast with bright citrus and fragrant herbs.',
      cookTime: '45 min',
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Mediterranean',
    },
  },
  {
    type: 'quick_replies',
    data: {
      replies: [
        'Show ingredients',
        'Step-by-step instructions',
        'Find similar recipes',
      ],
    },
  },
]

const INITIAL_MESSAGES: ChatMessage[] = [
  createAssistantMessage(generateId(), MOCK_BLOCKS_WELCOME),
  {
    id: generateId(),
    role: 'user',
    content: 'Show me a quick dinner idea',
    timestamp: new Date(Date.now() - 60_000),
  },
  createAssistantMessage(generateId(), MOCK_BLOCKS_RECIPE),
]

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseChatReturn {
  messages: ChatMessage[]
  isThinking: boolean
  sendMessage: (text: string) => void
  handleAction: (text: string) => void
}

/**
 * Manages local chat state.
 * For now uses hardcoded initial messages and simple state management.
 * Will be wired to Gemini backend in a future bead.
 */
export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [isThinking, setIsThinking] = useState(false)

  const appendUserMessage = useCallback((text: string) => {
    const msg = createUserMessage(generateId(), text)
    setMessages((prev) => [...prev, msg])
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      appendUserMessage(text)
      // Stub: simulate thinking briefly, no actual AI response yet
      setIsThinking(true)
      setTimeout(() => {
        setIsThinking(false)
      }, 1500)
    },
    [appendUserMessage],
  )

  const handleAction = useCallback(
    (text: string) => {
      sendMessage(text)
    },
    [sendMessage],
  )

  return { messages, isThinking, sendMessage, handleAction }
}
