import React, { useCallback, useEffect, useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { loadShoppingList } from '../../services/shopping'

interface RecipeOption {
  id: string
  title: string
  emoji: string
}

interface Props {
  visible: boolean
  onClose: () => void
  onAdd: (recipeId: string) => void
}

function recipeEmoji(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes('chicken') || lower.includes('poultry')) return '🍗'
  if (lower.includes('beef') || lower.includes('steak')) return '🥩'
  if (
    lower.includes('fish') ||
    lower.includes('salmon') ||
    lower.includes('tuna')
  )
    return '🐟'
  if (lower.includes('pasta') || lower.includes('spaghetti')) return '🍝'
  if (lower.includes('pizza')) return '🍕'
  if (lower.includes('salad')) return '🥗'
  if (lower.includes('soup') || lower.includes('stew')) return '🍲'
  if (lower.includes('curry')) return '🍛'
  if (lower.includes('rice')) return '🍚'
  if (
    lower.includes('cake') ||
    lower.includes('dessert') ||
    lower.includes('sweet')
  )
    return '🎂'
  return '🍽️'
}

/**
 * Bottom sheet for selecting a recipe to highlight in the shopping list.
 * Loads unique recipes from the current shopping list as options.
 * Matches view-43 mockup structure.
 */
export default function AddRecipeSheet({ visible, onClose, onAdd }: Props) {
  const [recipes, setRecipes] = useState<RecipeOption[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!visible) return
    loadShoppingList().then((list) => {
      const seen = new Set<string>()
      const unique: RecipeOption[] = []
      for (const item of list) {
        if (!seen.has(item.recipeId)) {
          seen.add(item.recipeId)
          unique.push({
            id: item.recipeId,
            title: item.recipeTitle,
            emoji: recipeEmoji(item.recipeTitle),
          })
        }
      }
      setRecipes(unique)
      setSelectedId(null)
      setSearch('')
    })
  }, [visible])

  const filtered = search.trim()
    ? recipes.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
      )
    : recipes

  const handleAdd = useCallback(() => {
    if (!selectedId) return
    onAdd(selectedId)
    onClose()
  }, [selectedId, onAdd, onClose])

  const selectedRecipe = recipes.find((r) => r.id === selectedId)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Dimmed overlay */}
        <Pressable
          className="absolute inset-0 bg-bg-overlay"
          onPress={onClose}
        />

        {/* Bottom sheet */}
        <View
          className="bg-bg-surface rounded-t-[24px]"
          style={{ maxHeight: '82%' }}
        >
          {/* Handle bar */}
          <View className="items-center pt-2.5 pb-1">
            <View className="w-10 h-1 rounded-full bg-border-strong" />
          </View>

          {/* Header */}
          <View className="px-5 pt-3.5 pb-3 border-b border-border-subtle">
            <Text className="text-[19px] font-extrabold tracking-tight text-text">
              Add to Shopping List
            </Text>
            <Text className="text-sm text-text-3 mt-0.5">
              Select a recipe to add ingredients
            </Text>
          </View>

          {/* Search bar */}
          <View className="px-4 pt-3">
            <View
              className="flex-row items-center bg-bg-elevated border border-border rounded-full px-3.5 py-2.5"
              style={{ gap: 10 }}
            >
              <Text className="text-text-3">🔍</Text>
              <TextInput
                className="flex-1 text-base text-text"
                placeholder="Search your recipes…"
                placeholderTextColor="#A8A09A"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          {/* Recipe list */}
          <ScrollView
            className="px-4 pt-3.5"
            style={{ maxHeight: 360 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-[11px] font-bold tracking-widest uppercase text-text-3 mb-2">
              Your Recipes
            </Text>

            {filtered.length === 0 && (
              <Text className="text-sm text-text-3 py-6 text-center">
                {recipes.length === 0
                  ? 'Add recipes from chat to see them here'
                  : 'No recipes found'}
              </Text>
            )}

            {filtered.map((recipe) => {
              const isSelected = recipe.id === selectedId
              return (
                <Pressable
                  key={recipe.id}
                  onPress={() => setSelectedId(isSelected ? null : recipe.id)}
                  className={`flex-row items-center p-3 rounded-[16px] border mb-2 ${
                    isSelected
                      ? 'bg-brand-50 border-brand'
                      : 'bg-bg-surface border-border'
                  }`}
                  style={{ gap: 12 }}
                >
                  {/* Checkbox */}
                  <View
                    className={`items-center justify-center flex-shrink-0 rounded-[6px] border-2 ${
                      isSelected ? 'bg-brand border-brand' : 'border-border'
                    }`}
                    style={{ width: 22, height: 22 }}
                  >
                    {isSelected && (
                      <Text className="text-text-inv text-xs font-bold">✓</Text>
                    )}
                  </View>

                  {/* Thumbnail */}
                  <View
                    className="bg-bg-elevated items-center justify-center flex-shrink-0 rounded-[12px] overflow-hidden"
                    style={{ width: 46, height: 46 }}
                  >
                    <Text style={{ fontSize: 20 }}>{recipe.emoji}</Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1 min-w-0">
                    <Text
                      className={`text-[14px] font-semibold ${isSelected ? 'text-brand' : 'text-text'}`}
                      numberOfLines={1}
                    >
                      {recipe.title}
                    </Text>
                  </View>
                </Pressable>
              )
            })}
            {/* bottom padding inside scroll */}
            <View style={{ height: 8 }} />
          </ScrollView>

          {/* Footer buttons */}
          <View
            className="flex-row border-t border-border-subtle px-4 py-3"
            style={{ gap: 12, paddingBottom: 34 }}
          >
            <Pressable
              onPress={onClose}
              className="flex-1 py-3 rounded-full border border-border items-center justify-center"
            >
              <Text className="text-base font-semibold text-text">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              disabled={!selectedId}
              className={`py-3 rounded-full items-center justify-center ${
                selectedId ? 'bg-brand' : 'bg-brand opacity-40'
              }`}
              style={{ flex: 2 }}
            >
              <Text
                className="text-base font-semibold text-text-inv"
                numberOfLines={1}
              >
                {selectedRecipe ? `Add ${selectedRecipe.title}` : 'Add Recipe'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
