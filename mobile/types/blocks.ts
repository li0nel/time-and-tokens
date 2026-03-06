/**
 * blocks.ts — Contract layer for Mise AI cooking chat.
 *
 * The Gemini backend returns `{ blocks: Block[] }`. Each block type maps
 * 1:1 to a React Native widget component. This file is the single source
 * of truth for the block schema. Treat as frozen after initial QA sign-off.
 */

// ---------------------------------------------------------------------------
// Block type discriminant literals
// ---------------------------------------------------------------------------

export type BlockType =
  | 'text'
  | 'recipe_card'
  | 'ingredients'
  | 'cook_steps'
  | 'quick_replies'
  | 'recipe_carousel'
  | 'rescue'

// ---------------------------------------------------------------------------
// Individual block interfaces
// ---------------------------------------------------------------------------

/** Plain prose message from the assistant. */
export interface TextBlock {
  type: 'text'
  data: {
    content: string
  }
}

/** Summary card for a single recipe — shown inline in chat. */
export interface RecipeCardBlock {
  type: 'recipe_card'
  data: {
    /** Unique recipe identifier (matches Recipe.id in data/recipes.ts). */
    recipeId: string
    title: string
    description: string
    /** Remote or local image URL. Optional — some AI-generated recipes may lack one. */
    imageUrl?: string
    /** Human-readable cook time, e.g. "45 min". */
    cookTime: string
    servings: number
    /** Skill level of the recipe. */
    difficulty: 'easy' | 'medium' | 'hard'
    /** Cuisine tag, e.g. "French", "Thai". */
    cuisine?: string
  }
}

/** A single ingredient row. */
export interface Ingredient {
  name: string
  /** Numeric or fractional quantity string, e.g. "2", "0.5". */
  amount: string
  /** Unit of measurement, e.g. "g", "tbsp", "cups". Metric only. */
  unit: string
  /** Optional clarification, e.g. "finely chopped". */
  note?: string
}

/** Scrollable ingredient list for a recipe. */
export interface IngredientsBlock {
  type: 'ingredients'
  data: {
    recipeTitle: string
    servings: number
    ingredients: Ingredient[]
  }
}

/** A single numbered cooking step. */
export interface CookStep {
  stepNumber: number
  instruction: string
  /** Optional estimated time for this step, e.g. "10 min". */
  time?: string
  /** Optional inline tip shown inside the step. */
  tip?: string
  /** Optional warning shown inside the step (e.g. safety notes). */
  warning?: string
}

/** Ordered list of cook steps displayed top-to-bottom (no pagination). */
export interface CookStepsBlock {
  type: 'cook_steps'
  data: {
    recipeTitle: string
    steps: CookStep[]
  }
}

/** A single compact recipe card in a carousel. */
export interface CarouselRecipeItem {
  recipeId: string
  title: string
  cookTime: string
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine?: string
  imageUrl?: string
}

/** Horizontally scrollable row of compact recipe cards. */
export interface RecipeCarouselBlock {
  type: 'recipe_carousel'
  data: {
    items: CarouselRecipeItem[]
  }
}

/** A single rescue/recovery step. */
export interface RescueStep {
  stepNumber: number
  instruction: string
}

/** Cook error recovery guidance block. */
export interface RescueBlock {
  type: 'rescue'
  data: {
    /** Reassuring header, e.g. "Don't worry! Here's how to fix it." */
    header: string
    steps: RescueStep[]
    /** Optional encouraging closing note. */
    tip?: string
  }
}

/** Horizontal row of tappable suggestion chips. */
export interface QuickRepliesBlock {
  type: 'quick_replies'
  data: {
    /**
     * Each string is injected as a user chat message when tapped.
     * Keep short: ≤ 40 characters recommended.
     */
    replies: string[]
  }
}

// ---------------------------------------------------------------------------
// Discriminated union of all block types
// ---------------------------------------------------------------------------

export type Block =
  | TextBlock
  | RecipeCardBlock
  | IngredientsBlock
  | CookStepsBlock
  | QuickRepliesBlock
  | RecipeCarouselBlock
  | RescueBlock

// ---------------------------------------------------------------------------
// Chat message
// ---------------------------------------------------------------------------

export interface ChatMessage {
  /** Client-generated UUID. */
  id: string
  role: 'user' | 'assistant'
  /**
   * Raw text content.
   * - For user messages: the typed message.
   * - For assistant messages: concatenated text from all TextBlocks (used as
   *   fallback for accessibility and history serialisation).
   */
  content: string
  /**
   * Structured blocks returned by Gemini. Present on assistant messages only.
   * The WidgetRenderer maps each block type to a React Native component.
   */
  blocks?: Block[]
  timestamp: Date
}
