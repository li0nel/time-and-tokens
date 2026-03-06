import React, { memo, useCallback, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { addIngredientsFromRecipe } from '../../services/shopping'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AddToListSheetProps {
  visible: boolean
  onClose: () => void
  onAdded?: (count: number) => void
  recipeTitle: string
  recipeId: string
  servings: number
  ingredients: {
    name: string
    amount: string
    unit: string
    note?: string
  }[]
}

interface IngredientRowProps {
  name: string
  note?: string
  scaledAmount: string
  unit: string
  checked: boolean
  onToggle: () => void
  index: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Scales a numeric amount string by the given ratio.
 * Returns a whole number string when the result is an integer,
 * otherwise rounds to 1 decimal place.
 */
function scaleAmount(amount: string, scale: number): string {
  const parsed = parseFloat(amount)
  if (isNaN(parsed)) return amount
  const scaled = parsed * scale
  if (Number.isInteger(scaled)) return String(scaled)
  return scaled.toFixed(1)
}

// ---------------------------------------------------------------------------
// IngredientRow
// ---------------------------------------------------------------------------

function IngredientRow({
  name,
  note,
  scaledAmount,
  unit,
  checked,
  onToggle,
  index,
}: IngredientRowProps) {
  return (
    <Pressable
      testID={`sheet-ingredient-row-${index}`}
      className="flex-row items-center py-3 border-b border-border-subtle"
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`${name}, ${scaledAmount} ${unit}`}
    >
      {/* Checkbox */}
      <View
        testID={`sheet-checkbox-${index}`}
        className={`w-[22px] h-[22px] rounded-md mr-3 border-2 items-center justify-center flex-shrink-0 ${
          checked
            ? 'bg-brand border-brand'
            : 'bg-bg-surface border-border-strong'
        }`}
      >
        {checked ? (
          <Text className="text-white" style={{ fontSize: 11, lineHeight: 13 }}>
            ✓
          </Text>
        ) : null}
      </View>

      {/* Name + note */}
      <View className={`flex-1 ${checked ? 'opacity-100' : 'opacity-40'}`}>
        <Text className="text-sm text-text">{name}</Text>
        {note ? (
          <Text className="text-xs text-text-3 mt-0.5">{note}</Text>
        ) : null}
      </View>

      {/* Scaled amount + unit — right aligned */}
      <Text
        className={`text-sm font-semibold text-text ml-3 flex-shrink-0 ${
          checked ? 'opacity-100' : 'opacity-40'
        }`}
      >
        {scaledAmount} {unit}
      </Text>
    </Pressable>
  )
}

// ---------------------------------------------------------------------------
// AddToListSheet
// ---------------------------------------------------------------------------

/**
 * AddToListSheet — bottom sheet modal for adding recipe ingredients to the
 * shopping list.
 *
 * Design reference: view-24-recipe-add-to-list-overlay.html
 *
 * Features:
 * - Dark overlay backdrop
 * - Sheet header: recipe title, base servings, close button
 * - Serve scaler row: [−] N servings [+] (scales displayed amounts)
 * - Ingredient checklist (all checked by default)
 * - Footer: "Add X items to List" brand button + Cancel ghost button
 * - On submit: calls addIngredientsFromRecipe() with checked items only
 */
function AddToListSheet({
  visible,
  onClose,
  onAdded,
  recipeTitle,
  recipeId,
  servings,
  ingredients,
}: AddToListSheetProps) {
  // All ingredients checked by default
  const [checked, setChecked] = useState<boolean[]>(() =>
    Array(ingredients.length).fill(true)
  )

  // Serving scale — starts at the recipe's base serving count
  const [servingScale, setServingScale] = useState<number>(servings)

  const [submitting, setSubmitting] = useState(false)

  // Reset state each time the sheet becomes visible
  React.useEffect(() => {
    if (visible) {
      setChecked(Array(ingredients.length).fill(true))
      setServingScale(servings)
      setSubmitting(false)
    }
  }, [visible, ingredients.length, servings])

  // Ratio to apply to ingredient amounts
  const ratio = servings > 0 ? servingScale / servings : 1

  const checkedCount = checked.filter(Boolean).length

  const toggleIngredient = useCallback((index: number) => {
    setChecked((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }, [])

  function decrementScale() {
    setServingScale((prev) => Math.max(1, prev - 1))
  }

  function incrementScale() {
    setServingScale((prev) => Math.min(20, prev + 1))
  }

  async function handleAddToList() {
    if (submitting || checkedCount === 0) return
    setSubmitting(true)

    try {
      const itemsToAdd = ingredients
        .filter((_, i) => checked[i] ?? false)
        .map((ingredient) => ({
          name: ingredient.name,
          amount: scaleAmount(ingredient.amount, ratio),
          unit: ingredient.unit,
          recipeId,
          recipeTitle,
          aisle: '',
        }))

      await addIngredientsFromRecipe(itemsToAdd)
      onAdded?.(itemsToAdd.length)
      onClose()
    } catch {
      // Non-critical — close anyway so UX is not blocked
      onAdded?.(0)
      onClose()
    }
  }

  const atMin = servingScale <= 1
  const atMax = servingScale >= 20

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Dark overlay */}
      <Pressable
        testID="sheet-backdrop"
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
        accessibilityLabel="Close sheet"
      >
        {/* Bottom sheet — stop event propagation so taps inside don't close */}
        <Pressable
          testID="add-to-list-sheet"
          className="bg-bg rounded-t-2xl"
          onPress={() => {
            // intentional no-op: prevent backdrop close
          }}
          accessibilityRole="none"
        >
          {/* Drag handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-border-strong" />
          </View>

          {/* Sheet header */}
          <View className="flex-row items-start px-5 pt-3 pb-4 border-b border-border-subtle">
            <View className="flex-1 mr-3">
              <Text className="text-base font-bold text-text">
                Add to Shopping List
              </Text>
              <Text className="text-sm text-text-2 mt-0.5" numberOfLines={2}>
                {recipeTitle} · {servings} servings
              </Text>
            </View>

            {/* Close button */}
            <Pressable
              testID="sheet-close-btn"
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-bg-elevated border border-border items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text className="text-base text-text-2">✕</Text>
            </Pressable>
          </View>

          {/* Serve scaler */}
          <View className="flex-row items-center px-5 py-4 border-b border-border-subtle">
            <Text className="text-sm font-semibold text-text flex-1">
              Servings
            </Text>

            <View className="flex-row items-center gap-3">
              {/* Decrement */}
              <Pressable
                testID="sheet-btn-decrement"
                onPress={decrementScale}
                disabled={atMin}
                accessibilityRole="button"
                accessibilityLabel="Decrease servings"
                className={`w-8 h-8 rounded-full border items-center justify-center ${
                  atMin
                    ? 'border-border-subtle bg-bg-elevated opacity-40'
                    : 'border-border-strong bg-bg-elevated'
                }`}
              >
                <Text className="text-base font-bold text-text">−</Text>
              </Pressable>

              {/* Count label */}
              <Text
                testID="sheet-servings-label"
                className="text-sm font-medium text-text min-w-[24px] text-center"
              >
                {servingScale}
              </Text>

              {/* Increment */}
              <Pressable
                testID="sheet-btn-increment"
                onPress={incrementScale}
                disabled={atMax}
                accessibilityRole="button"
                accessibilityLabel="Increase servings"
                className={`w-8 h-8 rounded-full border items-center justify-center ${
                  atMax
                    ? 'border-border-subtle bg-bg-elevated opacity-40'
                    : 'border-border-strong bg-bg-elevated'
                }`}
              >
                <Text className="text-base font-bold text-text">+</Text>
              </Pressable>
            </View>
          </View>

          {/* Ingredient count label */}
          <View className="px-5 pt-4 pb-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-text-3">
              Ingredients ({ingredients.length})
            </Text>
          </View>

          {/* Ingredient checklist — max-h-80 caps at 320 px to keep footer visible */}
          <ScrollView
            className="px-5 max-h-80"
            showsVerticalScrollIndicator={false}
          >
            {ingredients.map((ingredient, i) => (
              <IngredientRow
                key={`${ingredient.name}-${i}`}
                name={ingredient.name}
                note={ingredient.note}
                scaledAmount={scaleAmount(ingredient.amount, ratio)}
                unit={ingredient.unit}
                checked={checked[i] ?? false}
                onToggle={() => toggleIngredient(i)}
                index={i}
              />
            ))}
          </ScrollView>

          {/* Footer actions */}
          <View className="px-5 pt-4 pb-6 gap-2">
            <Pressable
              testID="sheet-btn-add"
              className={`py-3.5 rounded-xl items-center justify-center ${
                checkedCount === 0 || submitting
                  ? 'bg-brand opacity-50'
                  : 'bg-brand'
              }`}
              onPress={handleAddToList}
              disabled={checkedCount === 0 || submitting}
              accessibilityRole="button"
              accessibilityLabel={`Add ${checkedCount} items to shopping list`}
            >
              <Text className="text-base font-semibold text-white">
                {submitting
                  ? 'Adding…'
                  : `Add ${checkedCount} item${checkedCount === 1 ? '' : 's'} to List →`}
              </Text>
            </Pressable>

            <Pressable
              testID="sheet-btn-cancel"
              className="py-2.5 rounded-xl items-center justify-center"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text className="text-sm font-medium text-text-2">Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default memo(AddToListSheet)
