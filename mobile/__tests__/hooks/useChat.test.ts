/**
 * useChat.test.ts — Unit tests for hooks/useChat.ts
 *
 * Mocks services/chat to isolate hook logic.
 * firebase/ai and AsyncStorage are mocked in test/setup.ts.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native'
import { useChat } from '../../hooks/useChat'
import {
  createChatSession,
  sendChatMessage,
  loadTodayHistory,
  saveTodayHistory,
} from '../../services/chat'
import type { Block, ChatMessage } from '../../types/blocks'

// ---------------------------------------------------------------------------
// Mock services/chat
// ---------------------------------------------------------------------------

jest.mock('../../services/chat', () => ({
  createChatSession: jest.fn(),
  sendChatMessage: jest.fn(),
  loadTodayHistory: jest.fn(),
  saveTodayHistory: jest.fn(),
  buildSystemPrompt: jest.fn(() => 'mock prompt'),
}))

const mockCreateChatSession = createChatSession as jest.MockedFunction<
  typeof createChatSession
>
const mockSendChatMessage = sendChatMessage as jest.MockedFunction<
  typeof sendChatMessage
>
const mockLoadTodayHistory = loadTodayHistory as jest.MockedFunction<
  typeof loadTodayHistory
>
const mockSaveTodayHistory = saveTodayHistory as jest.MockedFunction<
  typeof saveTodayHistory
>

const MOCK_SESSION = { sendMessage: jest.fn() } as unknown as ReturnType<
  typeof createChatSession
>

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks()
  mockCreateChatSession.mockReturnValue(MOCK_SESSION)
  mockLoadTodayHistory.mockResolvedValue([])
  mockSaveTodayHistory.mockResolvedValue()
})

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('useChat — initial state', () => {
  it('starts with empty messages and isThinking=false', async () => {
    const { result } = renderHook(() => useChat())

    // Wait for the mount effect to complete
    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    expect(result.current.messages).toEqual([])
    expect(result.current.isThinking).toBe(false)
  })

  it('starts with toolCallStatus=null', async () => {
    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    expect(result.current.toolCallStatus).toBeNull()
  })

  it('loads today history on mount', async () => {
    const storedMessages: ChatMessage[] = [
      {
        id: 'old-msg',
        role: 'user',
        content: 'Good morning',
        timestamp: new Date(),
      },
    ]
    mockLoadTodayHistory.mockResolvedValue(storedMessages)

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1)
    })

    expect(result.current.messages[0]?.id).toBe('old-msg')
  })

  it('creates a chat session on mount', async () => {
    renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalledTimes(1)
    })
  })
})

// ---------------------------------------------------------------------------
// sendMessage
// ---------------------------------------------------------------------------

describe('useChat — sendMessage', () => {
  it('adds user message optimistically before AI responds', async () => {
    // Make sendChatMessage delay so we can observe intermediate state
    let resolveAI!: (blocks: Block[]) => void
    mockSendChatMessage.mockImplementation(
      () =>
        new Promise<Block[]>((resolve) => {
          resolveAI = resolve
        })
    )

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    act(() => {
      result.current.sendMessage('What can I cook tonight?')
    })

    // User message should be added immediately
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1)
    })

    expect(result.current.messages[0]?.role).toBe('user')
    expect(result.current.messages[0]?.content).toBe('What can I cook tonight?')

    // Resolve AI response
    act(() => {
      resolveAI([{ type: 'text', data: { content: 'Try pasta!' } }])
    })

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2)
    })
  })

  it('sets isThinking=true while waiting for AI, then false after', async () => {
    let resolveAI!: (blocks: Block[]) => void
    mockSendChatMessage.mockImplementation(
      () =>
        new Promise<Block[]>((resolve) => {
          resolveAI = resolve
        })
    )

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    act(() => {
      result.current.sendMessage('Hello')
    })

    await waitFor(() => {
      expect(result.current.isThinking).toBe(true)
    })

    act(() => {
      resolveAI([{ type: 'text', data: { content: 'Hi there!' } }])
    })

    await waitFor(() => {
      expect(result.current.isThinking).toBe(false)
    })
  })

  it('sets toolCallStatus while waiting for AI, then null after', async () => {
    let resolveAI!: (blocks: Block[]) => void
    mockSendChatMessage.mockImplementation(
      () =>
        new Promise<Block[]>((resolve) => {
          resolveAI = resolve
        })
    )

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    act(() => {
      result.current.sendMessage('Hello')
    })

    await waitFor(() => {
      expect(result.current.toolCallStatus).not.toBeNull()
    })

    act(() => {
      resolveAI([{ type: 'text', data: { content: 'Hi there!' } }])
    })

    await waitFor(() => {
      expect(result.current.toolCallStatus).toBeNull()
    })
  })

  it('clears toolCallStatus=null even after AI failure', async () => {
    mockSendChatMessage.mockRejectedValue(new Error('Timeout'))

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    act(() => {
      result.current.sendMessage('Fail please')
    })

    await waitFor(() => {
      expect(result.current.toolCallStatus).toBeNull()
    })
  })

  it('appends assistant blocks after AI responds', async () => {
    const responseBlocks: Block[] = [
      { type: 'text', data: { content: 'Here is a recipe!' } },
      { type: 'quick_replies', data: { replies: ['Show more', 'Back'] } },
    ]
    mockSendChatMessage.mockResolvedValue(responseBlocks)

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    act(() => {
      result.current.sendMessage('Give me a recipe')
    })

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2)
    })

    const assistantMsg = result.current.messages[1]
    expect(assistantMsg?.role).toBe('assistant')
    expect(assistantMsg?.blocks).toHaveLength(2)
    expect(assistantMsg?.blocks?.[0]?.type).toBe('text')
  })

  it('persists history after receiving response', async () => {
    mockSendChatMessage.mockResolvedValue([
      { type: 'text', data: { content: 'Response!' } },
    ])

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    act(() => {
      result.current.sendMessage('Save this')
    })

    await waitFor(() => {
      expect(mockSaveTodayHistory).toHaveBeenCalled()
    })

    const savedMessages = mockSaveTodayHistory.mock
      .calls[0]?.[0] as ChatMessage[]
    expect(savedMessages).toHaveLength(2)
  })

  it('appends error message block on AI failure', async () => {
    mockSendChatMessage.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    act(() => {
      result.current.sendMessage('This will fail')
    })

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2)
    })

    const errorMsg = result.current.messages[1]
    expect(errorMsg?.role).toBe('assistant')
    expect(errorMsg?.blocks?.[0]?.type).toBe('text')
    if (errorMsg?.blocks?.[0]?.type === 'text') {
      expect(errorMsg.blocks[0].data.content).toContain('Network error')
    }
  })

  it('sets isThinking=false even after AI failure', async () => {
    mockSendChatMessage.mockRejectedValue(new Error('Timeout'))

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    act(() => {
      result.current.sendMessage('Fail please')
    })

    await waitFor(() => {
      expect(result.current.isThinking).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// handleAction
// ---------------------------------------------------------------------------

describe('useChat — handleAction', () => {
  it('behaves identically to sendMessage', async () => {
    mockSendChatMessage.mockResolvedValue([
      { type: 'text', data: { content: 'Action response' } },
    ])

    const { result } = renderHook(() => useChat())

    await waitFor(() => {
      expect(mockCreateChatSession).toHaveBeenCalled()
    })

    act(() => {
      result.current.handleAction('Show ingredients')
    })

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2)
    })

    expect(result.current.messages[0]?.content).toBe('Show ingredients')
    expect(result.current.messages[0]?.role).toBe('user')
    expect(result.current.messages[1]?.role).toBe('assistant')
  })
})
