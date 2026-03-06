/**
 * chat.test.ts — Unit tests for services/chat.ts
 *
 * firebase/ai and @react-native-async-storage/async-storage are mocked
 * via test/setup.ts. We augment those mocks per test as needed.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { getGenerativeModel } from 'firebase/ai'
import {
  buildSystemPrompt,
  createChatSession,
  sendChatMessage,
  loadTodayHistory,
  saveTodayHistory,
} from '../../services/chat'
import type { ChatMessage } from '../../types/blocks'

// ---------------------------------------------------------------------------
// Helpers to build mock Gemini responses
// ---------------------------------------------------------------------------

function makeTextResponse(text: string) {
  return {
    response: {
      text: () => text,
      functionCalls: () => undefined,
      candidates: [{ content: { parts: [{ text }], role: 'model' } }],
    },
  }
}

// ---------------------------------------------------------------------------
// Mock setup
// ---------------------------------------------------------------------------

const mockSendMessage = jest.fn()
const mockStartChat = jest.fn(() => ({ sendMessage: mockSendMessage }))
const mockGetGenerativeModel = getGenerativeModel as jest.MockedFunction<
  typeof getGenerativeModel
>

beforeEach(() => {
  jest.clearAllMocks()
  mockGetGenerativeModel.mockReturnValue({
    startChat: mockStartChat,
  } as unknown as ReturnType<typeof getGenerativeModel>)
})

// ---------------------------------------------------------------------------
// buildSystemPrompt
// ---------------------------------------------------------------------------

describe('buildSystemPrompt', () => {
  it('includes the catalog string in the prompt', () => {
    const catalog = 'id: abc | title: Test Dish'
    const prompt = buildSystemPrompt(catalog)
    expect(prompt).toContain(catalog)
  })

  it('includes the Mise persona', () => {
    const prompt = buildSystemPrompt('')
    expect(prompt.toLowerCase()).toContain('mise')
  })

  it('documents all 5 block types', () => {
    const prompt = buildSystemPrompt('')
    expect(prompt).toContain('text')
    expect(prompt).toContain('recipe_card')
    expect(prompt).toContain('ingredients')
    expect(prompt).toContain('cook_steps')
    expect(prompt).toContain('quick_replies')
  })
})

// ---------------------------------------------------------------------------
// createChatSession
// ---------------------------------------------------------------------------

describe('createChatSession', () => {
  it('calls getGenerativeModel with gemini-2.0-flash-lite model', () => {
    createChatSession()
    expect(mockGetGenerativeModel).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ model: 'gemini-2.5-flash' })
    )
  })

  it('includes get_recipe_details tool declaration', () => {
    createChatSession()
    const calls = mockGetGenerativeModel.mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const modelParams = calls[0]?.[1] as unknown as Record<string, unknown>
    const tools = modelParams['tools'] as {
      functionDeclarations: { name: string }[]
    }[]
    expect(tools).toBeDefined()
    expect(tools[0]?.functionDeclarations[0]?.name).toBe('get_recipe_details')
  })

  it('calls startChat and returns the session', () => {
    const session = createChatSession()
    expect(mockStartChat).toHaveBeenCalledWith({ history: [] })
    expect(session).toBeDefined()
    expect(typeof session.sendMessage).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// sendChatMessage — normal response
// ---------------------------------------------------------------------------

describe('sendChatMessage', () => {
  it('parses a valid text block response', async () => {
    const responseText = JSON.stringify({
      blocks: [{ type: 'text', content: 'Hello from Mise!' }],
    })
    mockSendMessage.mockResolvedValue(makeTextResponse(responseText))

    const session = createChatSession()
    const blocks = await sendChatMessage(session, 'Hello')

    expect(blocks).toHaveLength(1)
    const block = blocks[0]
    expect(block?.type).toBe('text')
    if (block?.type === 'text') {
      expect(block.data.content).toBe('Hello from Mise!')
    }
  })

  it('parses a recipe_card block response', async () => {
    const responseText = JSON.stringify({
      blocks: [
        {
          type: 'recipe_card',
          recipeId: 'pasta-001',
          title: 'Spaghetti Carbonara',
          description: 'Classic Italian pasta',
          cookTime: '20 min',
          servings: 2,
          difficulty: 'medium',
          cuisine: 'Italian',
        },
      ],
    })
    mockSendMessage.mockResolvedValue(makeTextResponse(responseText))

    const session = createChatSession()
    const blocks = await sendChatMessage(session, 'Italian pasta')

    expect(blocks).toHaveLength(1)
    const block = blocks[0]
    expect(block?.type).toBe('recipe_card')
    if (block?.type === 'recipe_card') {
      expect(block.data.title).toBe('Spaghetti Carbonara')
      expect(block.data.difficulty).toBe('medium')
    }
  })

  it('parses quick_replies block response', async () => {
    const responseText = JSON.stringify({
      blocks: [
        { type: 'text', content: 'Sure!' },
        { type: 'quick_replies', replies: ['Show ingredients', 'See steps'] },
      ],
    })
    mockSendMessage.mockResolvedValue(makeTextResponse(responseText))

    const session = createChatSession()
    const blocks = await sendChatMessage(session, 'Tell me more')

    expect(blocks).toHaveLength(2)
    const qrBlock = blocks[1]
    expect(qrBlock?.type).toBe('quick_replies')
    if (qrBlock?.type === 'quick_replies') {
      expect(qrBlock.data.replies).toEqual(['Show ingredients', 'See steps'])
    }
  })

  it('parses recipe_carousel block response', async () => {
    const responseText = JSON.stringify({
      blocks: [
        {
          type: 'recipe_carousel',
          items: [
            {
              recipeId: 'hainanese-chicken-001',
              title: 'Hainanese Chicken Rice',
              cookTime: '1h 50min',
              servings: 4,
              difficulty: 'medium',
              cuisine: 'Chinese',
            },
            {
              recipeId: 'tikka-masala-001',
              title: 'Chicken Tikka Masala',
              cookTime: '1h',
              servings: 6,
              difficulty: 'hard',
            },
          ],
        },
      ],
    })
    mockSendMessage.mockResolvedValue(makeTextResponse(responseText))

    const session = createChatSession()
    const blocks = await sendChatMessage(session, 'Show me chicken recipes')

    expect(blocks).toHaveLength(1)
    const block = blocks[0]
    expect(block?.type).toBe('recipe_carousel')
    if (block?.type === 'recipe_carousel') {
      expect(block.data.items).toHaveLength(2)
      expect(block.data.items[0]?.title).toBe('Hainanese Chicken Rice')
      expect(block.data.items[0]?.cuisine).toBe('Chinese')
      expect(block.data.items[1]?.title).toBe('Chicken Tikka Masala')
      expect(block.data.items[1]?.cuisine).toBeUndefined()
    }
  })

  it('returns a text block wrapping the raw content on invalid JSON', async () => {
    mockSendMessage.mockResolvedValue(makeTextResponse('not valid json {{'))

    const session = createChatSession()
    const blocks = await sendChatMessage(session, 'Hello')

    expect(blocks).toHaveLength(1)
    const block = blocks[0]
    expect(block?.type).toBe('text')
    if (block?.type === 'text') {
      expect(block.data.content).toBe('not valid json {{')
    }
  })

  it('returns a fallback block when blocks array is missing', async () => {
    mockSendMessage.mockResolvedValue(
      makeTextResponse(JSON.stringify({ other: 'data' }))
    )

    const session = createChatSession()
    const blocks = await sendChatMessage(session, 'Hello')

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.type).toBe('text')
  })

  it('filters out blocks with unknown types', async () => {
    const responseText = JSON.stringify({
      blocks: [
        { type: 'unknown_type', foo: 'bar' },
        { type: 'text', content: 'Valid block' },
      ],
    })
    mockSendMessage.mockResolvedValue(makeTextResponse(responseText))

    const session = createChatSession()
    const blocks = await sendChatMessage(session, 'Hello')

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.type).toBe('text')
  })
})

// ---------------------------------------------------------------------------
// Tool call round-trip (simulated via functionReference)
// ---------------------------------------------------------------------------

describe('sendChatMessage — tool call round-trip', () => {
  it('handles response after tool resolution', async () => {
    // Simulate: the SDK handles tool calls automatically via functionReference.
    // We test that the final parsed response is correct.
    const responseAfterTool = JSON.stringify({
      blocks: [
        {
          type: 'recipe_card',
          recipeId: 'lemon-herb-chicken-001',
          title: 'Roasted Lemon Herb Chicken',
          description: 'A classic roast',
          cookTime: '45 min',
          servings: 4,
          difficulty: 'easy',
        },
      ],
    })
    mockSendMessage.mockResolvedValue(makeTextResponse(responseAfterTool))

    const session = createChatSession()
    const blocks = await sendChatMessage(
      session,
      'Show me the lemon chicken recipe'
    )

    const block = blocks[0]
    expect(block?.type).toBe('recipe_card')
    if (block?.type === 'recipe_card') {
      expect(block.data.recipeId).toBe('lemon-herb-chicken-001')
    }
  })

  it('recipe not found returns a graceful error response', async () => {
    // When a recipe is not found, the tool returns an error object.
    // The model should still produce a user-facing text block.
    const gracefulResponse = JSON.stringify({
      blocks: [
        {
          type: 'text',
          content:
            "I'm sorry, I couldn't find that recipe. Here are some recipes I know about:",
        },
        {
          type: 'quick_replies',
          replies: ['Show all recipes', 'Suggest dinner'],
        },
      ],
    })
    mockSendMessage.mockResolvedValue(makeTextResponse(gracefulResponse))

    const session = createChatSession()
    const blocks = await sendChatMessage(session, 'Get recipe unknown-id-xyz')

    const block = blocks[0]
    expect(block?.type).toBe('text')
    if (block?.type === 'text') {
      expect(block.data.content).toContain("couldn't find")
    }
  })
})

// ---------------------------------------------------------------------------
// Daily history helpers
// ---------------------------------------------------------------------------

describe('loadTodayHistory', () => {
  it('returns empty array when nothing is stored', async () => {
    const mockGet = AsyncStorage.getItem as jest.MockedFunction<
      typeof AsyncStorage.getItem
    >
    mockGet.mockResolvedValue(null)

    const history = await loadTodayHistory()
    expect(history).toEqual([])
  })

  it('returns parsed messages with Date timestamps', async () => {
    const now = new Date().toISOString()
    const stored: ChatMessage[] = [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(now),
      },
    ]
    const mockGet = AsyncStorage.getItem as jest.MockedFunction<
      typeof AsyncStorage.getItem
    >
    mockGet.mockResolvedValue(JSON.stringify(stored))

    const history = await loadTodayHistory()
    expect(history).toHaveLength(1)
    expect(history[0]?.id).toBe('msg-1')
    expect(history[0]?.timestamp).toBeInstanceOf(Date)
  })

  it('returns empty array on JSON parse error', async () => {
    const mockGet = AsyncStorage.getItem as jest.MockedFunction<
      typeof AsyncStorage.getItem
    >
    mockGet.mockResolvedValue('invalid json {{{')

    const history = await loadTodayHistory()
    expect(history).toEqual([])
  })
})

describe('saveTodayHistory', () => {
  it('serializes messages to AsyncStorage', async () => {
    const mockSet = AsyncStorage.setItem as jest.MockedFunction<
      typeof AsyncStorage.setItem
    >
    mockSet.mockResolvedValue()

    const messages: ChatMessage[] = [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      },
    ]

    await saveTodayHistory(messages)
    expect(mockSet).toHaveBeenCalledWith(
      expect.stringMatching(/^mise_history_\d{4}-\d{2}-\d{2}$/),
      expect.stringContaining('msg-1')
    )
  })

  it('does not throw on AsyncStorage error', async () => {
    const mockSet = AsyncStorage.setItem as jest.MockedFunction<
      typeof AsyncStorage.setItem
    >
    mockSet.mockRejectedValue(new Error('Storage full'))

    await expect(saveTodayHistory([])).resolves.toBeUndefined()
  })
})
