/**
 * shopping.ts — Types for the Mise shopping list feature.
 *
 * ShoppingItem represents a single ingredient line aggregated from one or more
 * recipes. ShoppingList is the full persisted list stored in AsyncStorage.
 */

export interface ShoppingItem {
  /** Client-generated unique identifier. */
  id: string
  /** Ingredient name, e.g. "butter". */
  name: string
  /** Numeric or fractional quantity string, e.g. "2", "0.5". */
  amount: string
  /** Unit of measurement, e.g. "g", "tbsp", "cups". */
  unit: string
  /** ID of the recipe this item was sourced from. */
  recipeId: string
  /** Display name of the source recipe. */
  recipeTitle: string
  /** Grocery store aisle or category, e.g. "Dairy", "Produce". */
  aisle: string
  /** Whether the item has been ticked off by the user. */
  checked: boolean
}

export type ShoppingList = ShoppingItem[]
