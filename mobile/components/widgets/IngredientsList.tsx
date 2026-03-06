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
  checked: boolean
  onToggle: () => void
  index: number
}

/**
 * A single ingredient row with a checkbox, ingredient name (left), and amount+unit (right).
 * Checked items become semi-transparent — no strikethrough.
 */
function IngredientRow({ ingredient, checked, onToggle, index }: IngredientRowProps) {
  const { name, amount, unit, note } = ingredient

  return (
    <Pressable
      testID={`ingredient-row-${index}`}
      className="flex-row items-center px-4 py-3 border-b border-border-subtle"
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`${name}, ${amount} ${unit}`}
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
        {amount} {unit}
      </Text>
    </Pressable>
  )
}

/**
 * IngredientsList widget — matches view-05 mock.
 * Shows header with recipe title and servings badge.
 * Each ingredient has a local checkbox (opacity change on check, no strikethrough).
 */
function IngredientsList({ block, onAction, testID }: Props) {
  const { recipeTitle, servings, ingredients } = block.data

  // Local checked state per ingredient index
  const [checked, setChecked] = useState<boolean[]>(() =>
    Array(ingredients.length).fill(false)
  )

  function toggle(index: number) {
    setChecked((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const checkedCount = checked.filter(Boolean).length

  return (
    <View
      testID={testID ?? 'ingredients-list'}
      className="rounded-xl overflow-hidden bg-bg-surface border border-border shadow-sm"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <View className="flex-1 mr-3">
          <Text className="text-md font-semibold text-text">Ingredients</Text>
          <Text className="text-sm text-text-2" numberOfLines={2}>
            {recipeTitle}
          </Text>
        </View>

        {/* Servings badge */}
        <View className="flex-row items-center gap-1 bg-bg-elevated px-3 py-1.5 rounded-full">
          <Text className="text-sm font-bold text-text">{servings}</Text>
          <Text className="text-sm text-text-2"> servings</Text>
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
          onPress={() => onAction(`Add ingredients for ${recipeTitle} to shopping list`)}
          accessibilityRole="button"
          accessibilityLabel={`Add all ingredients for ${recipeTitle} to shopping list`}
        >
          <Text className="text-sm font-semibold text-white">Add All to Shopping List →</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default memo(IngredientsList)
