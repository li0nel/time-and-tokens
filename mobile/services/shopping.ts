/**
 * shopping.ts — Shopping list service for Mise.
 *
 * Provides CRUD helpers for the user's shopping list, persisted locally via
 * AsyncStorage. All mutations return the updated list so callers can update
 * UI state in a single step.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ShoppingItem, ShoppingList } from '../types/shopping'

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'mise:shopping_list'

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/** Generates a simple unique ID without requiring the `uuid` package. */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

// ---------------------------------------------------------------------------
// Core persistence helpers
// ---------------------------------------------------------------------------

/**
 * Loads the shopping list from AsyncStorage.
 * Returns an empty array if nothing is stored or on parse error.
 */
export async function loadShoppingList(): Promise<ShoppingList> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ShoppingList
  } catch {
    return []
  }
}

/**
 * Persists the shopping list to AsyncStorage.
 * Errors are silently swallowed — persistence is non-critical.
 */
export async function saveShoppingList(list: ShoppingList): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Silent fail — UI can still function without successful persistence
  }
}

// ---------------------------------------------------------------------------
// List mutation helpers
// ---------------------------------------------------------------------------

/**
 * Appends ingredients from a recipe to the shopping list.
 *
 * Each ingredient is added as a new ShoppingItem with `checked: false`.
 * Duplicate detection is not performed — callers should de-duplicate upstream
 * if needed (e.g. check by name + recipeId before calling).
 *
 * @param items - Ingredient data without `id` and `checked` (generated here).
 * @returns The updated shopping list after save.
 */
export async function addIngredientsFromRecipe(
  items: Omit<ShoppingItem, 'id' | 'checked'>[]
): Promise<ShoppingList> {
  const current = await loadShoppingList()

  const newItems: ShoppingItem[] = items.map((item) => ({
    ...item,
    id: generateId(),
    checked: false,
  }))

  const updated = [...current, ...newItems]
  await saveShoppingList(updated)
  return updated
}

/**
 * Toggles the `checked` state of a single item by ID.
 * If the ID is not found the list is returned unchanged.
 *
 * @param id - The `ShoppingItem.id` to toggle.
 * @returns The updated shopping list after save.
 */
export async function toggleItem(id: string): Promise<ShoppingList> {
  const current = await loadShoppingList()

  const updated = current.map((item) =>
    item.id === id ? { ...item, checked: !item.checked } : item
  )

  await saveShoppingList(updated)
  return updated
}

/**
 * Removes all items where `checked === true`.
 *
 * @returns The updated shopping list (only unchecked items) after save.
 */
export async function clearCompleted(): Promise<ShoppingList> {
  const current = await loadShoppingList()

  const updated = current.filter((item) => !item.checked)

  await saveShoppingList(updated)
  return updated
}
