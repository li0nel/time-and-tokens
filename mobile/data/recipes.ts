/**
 * recipes.ts — Recipe data and catalogue helpers for the Mise app.
 */

import type { Ingredient, CookStep } from '../types/blocks'
import { RECIPES_PART1 } from './recipes-part1'
import { RECIPES_PART2 } from './recipes-part2'

// ---------------------------------------------------------------------------
// Recipe interface
// ---------------------------------------------------------------------------

export interface Recipe {
  id: string
  title: string
  description: string
  imageUrl?: string
  cookTime: string
  prepTime?: string
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine?: string
  ingredients: Ingredient[]
  steps: CookStep[]
  tags: string[]
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

const RECIPES: Recipe[] = [...RECIPES_PART1, ...RECIPES_PART2]

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id)
}

export function getRecipeCatalog(): string {
  return RECIPES.map(
    (r) =>
      `id: ${r.id} | title: ${r.title} | cuisine: ${r.cuisine ?? 'Various'} | difficulty: ${r.difficulty} | time: ${r.cookTime} | tags: ${r.tags.join(', ')}`
  ).join('\n')
}

export { RECIPES }
