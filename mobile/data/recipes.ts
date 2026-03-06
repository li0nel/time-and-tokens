/**
 * recipes.ts — Recipe data contract for the Mise app.
 *
 * The Recipe interface defines the shape of documents stored in the hardcoded
 * recipe catalogue (`data/recipes.ts` at build time). Recipes are referenced
 * by `recipeId` inside `RecipeCardBlock` and `IngredientsBlock`.
 *
 * No actual recipe data is included here — populate via a separate seed file.
 */

import type { Ingredient, CookStep } from '../types/blocks';

// ---------------------------------------------------------------------------
// Recipe interface
// ---------------------------------------------------------------------------

export interface Recipe {
  /** Stable unique identifier. Used as Firestore document ID if/when synced. */
  id: string;
  title: string;
  description: string;
  /** Remote or local image URL. */
  imageUrl?: string;
  /** Human-readable cook time, e.g. "45 min". */
  cookTime: string;
  /** Human-readable prep time, e.g. "15 min". */
  prepTime?: string;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Cuisine style, e.g. "French", "Thai". */
  cuisine?: string;
  /** Ingredient list. Metric units only. */
  ingredients: Ingredient[];
  /** Ordered cooking steps. */
  steps: CookStep[];
  /** Free-form tags for semantic search context, e.g. ["chicken", "weeknight"]. */
  tags: string[];
}
