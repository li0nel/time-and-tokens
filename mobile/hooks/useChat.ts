import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatSession } from 'firebase/ai'
import type { Block, ChatMessage } from '../types/blocks'
import {
  createChatSession,
  sendChatMessage,
  loadTodayHistory,
  saveTodayHistory,
} from '../services/chat'
import {
  createUserMessage,
  createAssistantMessage,
  generateId,
} from '../utils/chat'

// ---------------------------------------------------------------------------
// Hook interface
// ---------------------------------------------------------------------------

export interface UseChatReturn {
  messages: ChatMessage[]
  isThinking: boolean
  /** Non-null while an AI function call is in progress. */
  toolCallStatus: string | null
  sendMessage: (text: string) => void
  handleAction: (text: string) => void
}

// ---------------------------------------------------------------------------
// useChat
// ---------------------------------------------------------------------------

/**
 * Manages chat state backed by Gemini via Firebase AI Logic.
 *
 * On mount:
 *   1. Loads today's history from AsyncStorage.
 *   2. Creates a Gemini chat session.
 *
 * sendMessage / handleAction:
 *   - Adds the user message optimistically.
 *   - Sets isThinking=true while waiting for the model.
 *   - Appends the assistant response blocks.
 *   - Persists history to AsyncStorage.
 *   - On error, appends a fallback error text block.
 */
export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [toolCallStatus, setToolCallStatus] = useState<string | null>(null)

  const sessionRef = useRef<ChatSession | null>(null)

  // On mount: load history and create session
  useEffect(() => {
    let cancelled = false

    async function init() {
      const history = await loadTodayHistory()
      if (cancelled) return
      if (history.length > 0) {
        setMessages(history)
      }
      sessionRef.current = createChatSession()
    }

    void init()

    return () => {
      cancelled = true
    }
  }, [])

  const dispatchMessage = useCallback(async (text: string) => {
    const userMsg = createUserMessage(generateId(), text)

    // Optimistic update
    setMessages((prev) => [...prev, userMsg])
    setIsThinking(true)
    setToolCallStatus('Looking up recipe details...')

    try {
      if (!sessionRef.current) {
        sessionRef.current = createChatSession()
      }

      const blocks: Block[] = await sendChatMessage(sessionRef.current, text)
      const assistantMsg = createAssistantMessage(generateId(), blocks)

      setMessages((prev) => {
        const updated = [...prev, assistantMsg]
        void saveTodayHistory(updated)
        return updated
      })
    } catch (err) {
      const errorContent =
        err instanceof Error
          ? `Error: ${err.message}`
          : 'Sorry, something went wrong. Please try again.'

      const errorBlocks: Block[] = [
        {
          type: 'text',
          data: { content: errorContent },
        },
      ]
      const errorMsg = createAssistantMessage(generateId(), errorBlocks)

      setMessages((prev) => {
        const updated = [...prev, errorMsg]
        void saveTodayHistory(updated)
        return updated
      })
    } finally {
      setIsThinking(false)
      setToolCallStatus(null)
    }
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      void dispatchMessage(text)
    },
    [dispatchMessage]
  )

  const handleAction = useCallback(
    (text: string) => {
      void dispatchMessage(text)
    },
    [dispatchMessage]
  )

  return { messages, isThinking, toolCallStatus, sendMessage, handleAction }
}
