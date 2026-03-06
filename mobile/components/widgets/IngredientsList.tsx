import React, { memo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { Ingredient, IngredientsBlock } from '../../types/blocks'

interface Props {
  block: IngredientsBlock
  onAction: (message: string) => void
  testID?: string
}

interface IngredientRowProps {
  ingredient: Ingredient
  scaledAmount: string
  checked: boolean
  onToggle: () => void
  index: number
}

/**
 * Scales a numeric amount string by the given ratio.
 * Returns a whole number string when the result is an integer,
 * otherwise rounds to 1 decimal place.
 */
function scaleAmount(amount: string, scale: number): string {
  const parsed = parseFloat(amount)
  if (isNaN(parsed)) return amount
  const scaled = parsed * scale
  // Show whole number without decimal when possible
  if (Number.isInteger(scaled)) return String(scaled)
  return scaled.toFixed(1)
}

/**
 * A single ingredient row with a checkbox, ingredient name (left), and amount+unit (right).
 * Checked items become semi-transparent — no strikethrough.
 */
function IngredientRow({
  ingredient,
  scaledAmount,
  checked,
  onToggle,
  index,
}: IngredientRowProps) {
  const { name, unit, note } = ingredient

  return (
    <Pressable
      testID={`ingredient-row-${index}`}
      className="flex-row items-center px-4 py-3 border-b border-border-subtle"
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`${name}, ${scaledAmount} ${unit}`}
    >
      {/* Checkbox */}
      <View
        testID={`checkbox-${index}`}
        className={`w-5 h-5 rounded mr-3 border-2 items-center justify-center flex-shrink-0 ${
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

      {/* Name + note (flex-1 pushes amount to right) */}
      <View className={`flex-1 ${checked ? 'opacity-40' : 'opacity-100'}`}>
        <Text className="text-base text-text">{name}</Text>
        {note ? (
          <Text className="text-xs text-text-3 mt-0.5">{note}</Text>
        ) : null}
      </View>

      {/* Amount + unit (right-aligned) */}
      <Text
        className={`text-sm text-text-2 ml-3 flex-shrink-0 ${checked ? 'opacity-40' : 'opacity-100'}`}
      >
        {scaledAmount} {unit}
      </Text>
    </Pressable>
  )
}

/**
 * IngredientsList widget — matches view-05 mock.
 * Shows header with recipe title, a serve scaler (+/- buttons), and
 * each ingredient with a local checkbox (opacity change on check, no strikethrough).
 */
function IngredientsList({ block, onAction, testID }: Props) {
  const { recipeTitle, servings, ingredients } = block.data

  // Local checked state per ingredient index
  const [checked, setChecked] = useState<boolean[]>(() =>
    Array(ingredients.length).fill(false)
  )

  // Local serving scale — starts at the recipe's default serving count
  const [servingScale, setServingScale] = useState<number>(servings)

  function toggle(index: number) {
    setChecked((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  function decrementScale() {
    setServingScale((prev) => Math.max(1, prev - 1))
  }

  function incrementScale() {
    setServingScale((prev) => Math.min(20, prev + 1))
  }

  // Ratio to apply to every ingredient amount
  const ratio = servingScale / servings

  const checkedCount = checked.filter(Boolean).length

  return (
    <View
      testID={testID ?? 'ingredients-list'}
      className="rounded-xl overflow-hidden bg-bg-surface border border-border shadow-sm"
    >
      {/* Header */}
      <View className="px-4 py-3 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-md font-semibold text-text">Ingredients</Text>
            <Text className="text-sm text-text-2" numberOfLines={2}>
              {recipeTitle}
            </Text>
          </View>
        </View>

        {/* Serve scaler row */}
        <View className="flex-row items-center justify-end mt-2 gap-2">
          <Pressable
            testID="btn-decrement-servings"
            onPress={decrementScale}
            disabled={servingScale <= 1}
            accessibilityRole="button"
            accessibilityLabel="Decrease servings"
            className={`w-8 h-8 rounded-full border items-center justify-center ${
              servingScale <= 1
                ? 'border-border-subtle bg-bg-elevated opacity-40'
                : 'border-border-strong bg-bg-elevated'
            }`}
          >
            <Text className="text-base font-bold text-text">−</Text>
          </Pressable>

          <Text
            testID="servings-label"
            className="text-sm font-medium text-text min-w-[80px] text-center"
          >
            {servingScale} servings
          </Text>

          <Pressable
            testID="btn-increment-servings"
            onPress={incrementScale}
            disabled={servingScale >= 20}
            accessibilityRole="button"
            accessibilityLabel="Increase servings"
            className={`w-8 h-8 rounded-full border items-center justify-center ${
              servingScale >= 20
                ? 'border-border-subtle bg-bg-elevated opacity-40'
                : 'border-border-strong bg-bg-elevated'
            }`}
          >
            <Text className="text-base font-bold text-text">+</Text>
          </Pressable>
        </View>
      </View>

      {/* Progress note when some items checked */}
      {checkedCount > 0 ? (
        <View className="px-4 py-2 bg-success-bg border-b border-border-subtle">
          <Text className="text-xs text-success font-medium">
            {checkedCount} of {ingredients.length} items checked
          </Text>
        </View>
      ) : null}

      {/* Ingredient rows */}
      {ingredients.map((ingredient, i) => (
        <IngredientRow
          key={`${ingredient.name}-${i}`}
          ingredient={ingredient}
          scaledAmount={scaleAmount(ingredient.amount, ratio)}
          checked={checked[i] ?? false}
          onToggle={() => toggle(i)}
          index={i}
        />
      ))}

      {/* Footer action */}
      <View className="p-4 border-t border-border-subtle">
        <Pressable
          testID="btn-add-to-list"
          className="py-3 rounded-lg bg-brand items-center justify-center"
          onPress={() =>
            onAction(`Add ingredients for ${recipeTitle} to shopping list`)
          }
          accessibilityRole="button"
          accessibilityLabel={`Add all ingredients for ${recipeTitle} to shopping list`}
        >
          <Text className="text-sm font-semibold text-white">
            Add All to Shopping List →
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export default memo(IngredientsList)
