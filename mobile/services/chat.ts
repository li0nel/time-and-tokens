/**
 * chat.ts — Gemini chat service for Mise.
 *
 * Uses Firebase AI Logic SDK (firebase/ai) to communicate with Gemini 2.0 Flash.
 * Handles structured JSON responses (blocks), tool calls (get_recipe_details),
 * and daily history persistence via AsyncStorage.
 */

import { getGenerativeModel, Schema } from 'firebase/ai'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ChatSession, FunctionResponsePart, GenerateContentResult } from 'firebase/ai'
import type { Block, ChatMessage } from '../types/blocks'
import { getRecipeCatalog, getRecipeById } from '../data/recipes'
import { ai } from './gemini'

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export function buildSystemPrompt(catalog: string): string {
  return `You are Mise, a friendly and knowledgeable AI cooking assistant. Your goal is to help users discover recipes, understand ingredients, and guide them through cooking techniques.

RESPONSE FORMAT — CRITICAL:
You MUST ALWAYS respond with raw JSON only. No markdown, no prose, no code fences.
Your entire response must be valid JSON matching this exact structure:
{ "blocks": [ ...block objects... ] }
Never write plain text. Every response, including errors or "I don't know" replies, must be a JSON object with a blocks array containing at least one text block.

BLOCK TYPES:
Each response is made up of typed blocks. Use the most appropriate blocks for the context:

1. text — Plain prose message.
   Fields: type="text", content (string)
   Example: { "type": "text", "content": "Here's a great pasta dish!" }

2. recipe_card — Summary card for a single recipe shown inline in chat.
   Fields: type="recipe_card", recipeId, title, description, cookTime, servings, difficulty ("easy"|"medium"|"hard"), cuisine (optional)
   Use this to showcase a recipe at a high level.

3. ingredients — Scrollable ingredient list for a recipe.
   Fields: type="ingredients", recipeTitle, ingredients (array of { name, amount, unit })
   Use this when the user asks for ingredients or the full ingredient list.

4. cook_steps — Ordered cooking instructions.
   Fields: type="cook_steps", recipeTitle, steps (array of { stepNumber, instruction })
   Use this when the user asks how to cook something or for step-by-step instructions.

5. quick_replies — Horizontal chips for suggested follow-up actions.
   Fields: type="quick_replies", replies (array of short strings, ≤40 chars each)
   Always end responses with 2-4 quick reply suggestions when appropriate.

TOOL USE:
You have access to the get_recipe_details tool. Use it when you need full recipe details (ingredients, steps) to respond accurately. You can call it with a recipe_id from the catalog below.

TOPIC BOUNDARY:
You only discuss cooking, recipes, ingredients, kitchen techniques, and food. If asked about anything outside cooking and food, politely decline and redirect to cooking topics.

RECIPE CATALOG:
${catalog}`
}

// ---------------------------------------------------------------------------
// Tool: get_recipe_details
// ---------------------------------------------------------------------------

function handleGetRecipeDetails(args: Record<string, unknown>): unknown {
  const recipeId = args['recipe_id'] as string
  const recipe = getRecipeById(recipeId)
  if (!recipe) {
    return { error: `Recipe with id "${recipeId}" not found in catalog.` }
  }
  return recipe
}

// ---------------------------------------------------------------------------
// createChatSession
// ---------------------------------------------------------------------------

export function createChatSession(): ChatSession {
  const model = getGenerativeModel(ai, {
    model: 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(getRecipeCatalog()),
    tools: [
      {
        functionDeclarations: [
          {
            name: 'get_recipe_details',
            description:
              'Retrieve full details for a recipe by its ID, including ingredients and cooking steps.',
            parameters: Schema.object({
              properties: {
                recipe_id: Schema.string(),
              },
            }),
          },
        ],
      },
    ],
  })

  return model.startChat({ history: [] })
}

// ---------------------------------------------------------------------------
// sendChatMessage
// ---------------------------------------------------------------------------

/**
 * Tries to parse a JSON object with a "blocks" array from text.
 * Handles cases where function-call result text is prepended before the JSON.
 */
function extractBlocksObject(text: string): { blocks: unknown[] } | null {
  // Fast path: whole text is valid JSON
  try {
    const parsed = JSON.parse(text) as { blocks?: unknown[] }
    if (parsed.blocks && Array.isArray(parsed.blocks)) return parsed as { blocks: unknown[] }
  } catch {}

  // Fallback: find the last {"blocks": ...} substring and parse from there
  const blocksIdx = text.lastIndexOf('"blocks"')
  if (blocksIdx !== -1) {
    const openBrace = text.lastIndexOf('{', blocksIdx)
    if (openBrace !== -1) {
      try {
        const candidate = JSON.parse(text.substring(openBrace)) as { blocks?: unknown[] }
        if (candidate.blocks && Array.isArray(candidate.blocks))
          return candidate as { blocks: unknown[] }
      } catch {}
    }
  }
  return null
}

/**
 * Parses a raw JSON response text from Gemini into a Block[].
 * Returns a fallback error block on parse failure.
 */
function parseBlocks(text: string): Block[] {
  const obj = extractBlocksObject(text)
  if (obj) {
    return obj.blocks.map(flatBlockToBlock).filter(Boolean) as Block[]
  }

  // Gemini returned plain text instead of JSON — wrap it as a text block
  if (typeof text === 'string' && text.trim().length > 0) {
    return [{ type: 'text', data: { content: text.trim() } }]
  }
  return [
    {
      type: 'text',
      data: { content: 'Sorry, I encountered an error. Please try again.' },
    },
  ]
}

/**
 * Converts a flat block object (from Gemini's flat schema) to a typed Block.
 */
function flatBlockToBlock(flat: unknown): Block | null {
  if (typeof flat !== 'object' || flat === null) return null

  const b = flat as Record<string, unknown>
  const type = b['type'] as string

  switch (type) {
    case 'text':
      return {
        type: 'text',
        data: {
          content: (b['content'] as string | undefined) ?? '',
        },
      }

    case 'recipe_card':
      return {
        type: 'recipe_card',
        data: {
          recipeId: (b['recipeId'] as string | undefined) ?? '',
          title: (b['title'] as string | undefined) ?? '',
          description: (b['description'] as string | undefined) ?? '',
          cookTime: (b['cookTime'] as string | undefined) ?? '',
          servings: (b['servings'] as number | undefined) ?? 0,
          difficulty: ((b['difficulty'] as string | undefined) ?? 'easy') as
            | 'easy'
            | 'medium'
            | 'hard',
          cuisine: b['cuisine'] as string | undefined,
        },
      }

    case 'ingredients': {
      const rawIngredients = b['ingredients']
      const ingredients = Array.isArray(rawIngredients)
        ? (rawIngredients as Record<string, unknown>[]).map((ing) => ({
            name: (ing['name'] as string | undefined) ?? '',
            amount: (ing['amount'] as string | undefined) ?? '',
            unit: (ing['unit'] as string | undefined) ?? '',
          }))
        : []
      return {
        type: 'ingredients',
        data: {
          recipeTitle: (b['recipeTitle'] as string | undefined) ?? '',
          servings: (b['servings'] as number | undefined) ?? 0,
          ingredients,
        },
      }
    }

    case 'cook_steps': {
      const rawSteps = b['steps']
      const steps = Array.isArray(rawSteps)
        ? (rawSteps as Record<string, unknown>[]).map((s) => ({
            stepNumber: (s['stepNumber'] as number | undefined) ?? 0,
            instruction: (s['instruction'] as string | undefined) ?? '',
          }))
        : []
      return {
        type: 'cook_steps',
        data: {
          recipeTitle: (b['recipeTitle'] as string | undefined) ?? '',
          steps,
        },
      }
    }

    case 'quick_replies': {
      const rawReplies = b['replies']
      const replies = Array.isArray(rawReplies)
        ? (rawReplies as unknown[]).filter((r) => typeof r === 'string') as string[]
        : []
      return {
        type: 'quick_replies',
        data: { replies },
      }
    }

    default:
      return null
  }
}

export async function sendChatMessage(
  session: ChatSession,
  userText: string,
): Promise<Block[]> {
  let result: GenerateContentResult = await session.sendMessage(userText)

  // Handle function calls manually (loop until Gemini returns a text response)
  for (let i = 0; i < 5; i++) {
    const calls = result.response.functionCalls()
    if (!calls || calls.length === 0) break

    const parts: FunctionResponsePart[] = calls.map((call) => ({
      functionResponse: {
        name: call.name,
        response: (call.name === 'get_recipe_details'
          ? handleGetRecipeDetails(call.args as Record<string, unknown>)
          : { error: `Unknown function: ${call.name}` }) as object,
      },
    }))

    result = await session.sendMessage(parts)
  }

  const text = result.response.text()
  return parseBlocks(text)
}

// ---------------------------------------------------------------------------
// Daily history helpers
// ---------------------------------------------------------------------------

const historyKey = (): string =>
  `mise_history_${new Date().toISOString().slice(0, 10)}`

export async function loadTodayHistory(): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(historyKey())
    if (!raw) return []
    const parsed = JSON.parse(raw) as ChatMessage[]
    // Restore Date objects from serialized timestamps
    return parsed.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))
  } catch {
    return []
  }
}

export async function saveTodayHistory(messages: ChatMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(historyKey(), JSON.stringify(messages))
  } catch {
    // Silent fail — history persistence is non-critical
  }
}
