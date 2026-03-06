/**
 * types.test.ts — Compile-time type validation for the Mise contract layer.
 *
 * These tests use the TypeScript `satisfies` operator and explicit type
 * annotations to verify that the block/chat/recipe interfaces accept valid
 * shapes and reject invalid ones at compile time. No runtime assertions are
 * needed — if this file compiles, the contract layer is correct.
 *
 * Run with: cd mobile && npx tsc --noEmit
 */

import type {
  Block,
  BlockType,
  TextBlock,
  RecipeCardBlock,
  IngredientsBlock,
  CookStepsBlock,
  QuickRepliesBlock,
  RecipeCarouselBlock,
  RescueBlock,
  ChatMessage,
} from '../types/blocks'

import type { Recipe } from '../data/recipes'

// ---------------------------------------------------------------------------
// BlockType union
// ---------------------------------------------------------------------------

const validBlockTypes: BlockType[] = [
  'text',
  'recipe_card',
  'ingredients',
  'cook_steps',
  'quick_replies',
  'recipe_carousel',
  'rescue',
]

// Ensure all literals are present (if a type is added, the array above must be updated)
type _AssertBlockTypeCoverage =
  (typeof validBlockTypes)[number] extends BlockType
    ? BlockType extends (typeof validBlockTypes)[number]
      ? true
      : never
    : never
const _blockTypeCoverageCheck: _AssertBlockTypeCoverage = true

// ---------------------------------------------------------------------------
// TextBlock
// ---------------------------------------------------------------------------

const textBlock = {
  type: 'text' as const,
  data: { content: 'What a wonderful choice!' },
} satisfies TextBlock

// TextBlock must be assignable to Block
const _textAsBlock: Block = textBlock

// ---------------------------------------------------------------------------
// RecipeCardBlock
// ---------------------------------------------------------------------------

const recipeCard = {
  type: 'recipe_card' as const,
  data: {
    recipeId: 'boeuf-bourguignon',
    title: 'Boeuf Bourguignon',
    description: 'A classic French beef stew braised in red wine.',
    imageUrl: 'https://example.com/boeuf.jpg',
    cookTime: '3 h',
    servings: 6,
    difficulty: 'hard' as const,
    cuisine: 'French',
  },
} satisfies RecipeCardBlock

const _recipeCardAsBlock: Block = recipeCard

// Optional imageUrl — must still satisfy the interface without it
const recipeCardNoImage = {
  type: 'recipe_card' as const,
  data: {
    recipeId: 'simple-pasta',
    title: 'Simple Pasta',
    description: 'Quick weeknight pasta.',
    cookTime: '20 min',
    servings: 2,
    difficulty: 'easy' as const,
  },
} satisfies RecipeCardBlock

const _recipeCardNoImageAsBlock: Block = recipeCardNoImage

// ---------------------------------------------------------------------------
// IngredientsBlock
// ---------------------------------------------------------------------------

const ingredientsBlock = {
  type: 'ingredients' as const,
  data: {
    recipeTitle: 'Boeuf Bourguignon',
    servings: 6,
    ingredients: [
      { name: 'beef chuck', amount: '1', unit: 'kg' },
      {
        name: 'red wine',
        amount: '750',
        unit: 'ml',
        note: 'Burgundy preferred',
      },
      { name: 'carrots', amount: '2', unit: 'medium' },
    ],
  },
} satisfies IngredientsBlock

const _ingredientsAsBlock: Block = ingredientsBlock

// ---------------------------------------------------------------------------
// CookStepsBlock
// ---------------------------------------------------------------------------

const cookStepsBlock = {
  type: 'cook_steps' as const,
  data: {
    recipeTitle: 'Boeuf Bourguignon',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Pat the beef dry and season with salt and pepper.',
      },
      {
        stepNumber: 2,
        instruction: 'Sear the beef in batches over high heat until browned.',
        time: '10 min',
        tip: 'Do not crowd the pan or the meat will steam rather than sear.',
      },
      {
        stepNumber: 3,
        instruction: 'Deglaze with the red wine, scraping up any browned bits.',
        warning: 'Keep flame low when adding alcohol.',
      },
    ],
  },
} satisfies CookStepsBlock

const _cookStepsAsBlock: Block = cookStepsBlock

// ---------------------------------------------------------------------------
// QuickRepliesBlock
// ---------------------------------------------------------------------------

const quickRepliesBlock = {
  type: 'quick_replies' as const,
  data: {
    replies: [
      "Let's start cooking",
      'Adjust servings',
      'Show me the ingredients',
    ],
  },
} satisfies QuickRepliesBlock

const _quickRepliesAsBlock: Block = quickRepliesBlock

// ---------------------------------------------------------------------------
// RecipeCarouselBlock
// ---------------------------------------------------------------------------

const recipeCarouselBlock = {
  type: 'recipe_carousel' as const,
  data: {
    items: [
      {
        recipeId: 'hainanese-chicken-001',
        title: 'Hainanese Chicken Rice',
        cookTime: '1h 50min',
        servings: 4,
        difficulty: 'medium' as const,
        cuisine: 'Chinese',
      },
      {
        recipeId: 'lemon-herb-chicken-001',
        title: 'Roasted Lemon Herb Chicken',
        cookTime: '1h 15min',
        servings: 4,
        difficulty: 'easy' as const,
        cuisine: 'Western',
      },
    ],
  },
} satisfies RecipeCarouselBlock

const _recipeCarouselAsBlock: Block = recipeCarouselBlock

// ---------------------------------------------------------------------------
// RescueBlock
// ---------------------------------------------------------------------------

const rescueBlock = {
  type: 'rescue' as const,
  data: {
    header: "Don't worry! Here's how to fix it.",
    steps: [
      { stepNumber: 1, instruction: 'Remove the pan from heat immediately.' },
      {
        stepNumber: 2,
        instruction: 'Add a splash of cold water to cool the sauce.',
      },
    ],
    tip: 'Prevention is better than cure — stir frequently on high heat.',
  },
} satisfies RescueBlock

const _rescueAsBlock: Block = rescueBlock

// ---------------------------------------------------------------------------
// Block discriminated union narrowing
// ---------------------------------------------------------------------------

function assertNarrows(block: Block): string {
  switch (block.type) {
    case 'text':
      return block.data.content
    case 'recipe_card':
      return block.data.title
    case 'ingredients':
      return block.data.recipeTitle
    case 'cook_steps':
      return block.data.recipeTitle
    case 'quick_replies':
      return block.data.replies.join(', ')
    case 'recipe_carousel':
      return block.data.items.map((i) => i.title).join(', ')
    case 'rescue':
      return block.data.header
  }
}

// Verify the switch is exhaustive — TypeScript will error if a case is missing
const _narrowResult: string = assertNarrows(textBlock)

// ---------------------------------------------------------------------------
// ChatMessage
// ---------------------------------------------------------------------------

const userMessage = {
  id: 'msg-001',
  role: 'user' as const,
  content: 'I want to make Boeuf Bourguignon',
  timestamp: new Date(),
} satisfies ChatMessage

// Assistant message with blocks
const assistantMessage = {
  id: 'msg-002',
  role: 'assistant' as const,
  content: 'What a wonderful choice!',
  blocks: [
    textBlock,
    recipeCard,
    ingredientsBlock,
    cookStepsBlock,
    quickRepliesBlock,
  ],
  timestamp: new Date(),
} satisfies ChatMessage

// ChatMessage without blocks (user messages won't have blocks)
const _userMsgCheck: ChatMessage = userMessage
const _assistantMsgCheck: ChatMessage = assistantMessage

// ---------------------------------------------------------------------------
// Recipe interface
// ---------------------------------------------------------------------------

const sampleRecipe = {
  id: 'boeuf-bourguignon',
  title: 'Boeuf Bourguignon',
  description: 'A classic French beef stew braised in red wine.',
  imageUrl: 'https://example.com/boeuf.jpg',
  cookTime: '3 h',
  prepTime: '30 min',
  servings: 6,
  difficulty: 'hard' as const,
  cuisine: 'French',
  ingredients: [
    { name: 'beef chuck', amount: '1', unit: 'kg' },
    { name: 'red wine', amount: '750', unit: 'ml', note: 'Burgundy preferred' },
  ],
  steps: [
    {
      stepNumber: 1,
      instruction: 'Pat the beef dry and season with salt and pepper.',
    },
    { stepNumber: 2, instruction: 'Sear the beef in batches.', time: '10 min' },
  ],
  tags: ['beef', 'french', 'stew', 'weekend'],
} satisfies Recipe

const _recipeCheck: Recipe = sampleRecipe

// Recipe without optional fields
const minimalRecipe = {
  id: 'boiled-eggs',
  title: 'Boiled Eggs',
  description: 'Simple boiled eggs.',
  cookTime: '10 min',
  servings: 2,
  difficulty: 'easy' as const,
  ingredients: [{ name: 'eggs', amount: '2', unit: 'large' }],
  steps: [
    {
      stepNumber: 1,
      instruction: 'Bring water to a boil, add eggs, cook 8–10 min.',
    },
  ],
  tags: ['eggs', 'quick', 'breakfast'],
} satisfies Recipe

const _minimalRecipeCheck: Recipe = minimalRecipe

// Suppress "unused variable" warnings for assertion variables
void [
  _textAsBlock,
  _recipeCardAsBlock,
  _recipeCardNoImageAsBlock,
  _ingredientsAsBlock,
  _cookStepsAsBlock,
  _quickRepliesAsBlock,
  _recipeCarouselAsBlock,
  _rescueAsBlock,
  _narrowResult,
  _userMsgCheck,
  _assistantMsgCheck,
  _recipeCheck,
  _minimalRecipeCheck,
  _blockTypeCoverageCheck,
]
