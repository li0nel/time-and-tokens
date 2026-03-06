import React, { useState, useCallback } from 'react'
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import {
  loadShoppingList,
  toggleItem,
  clearCompleted,
} from '../../services/shopping'
import type { ShoppingItem, ShoppingList } from '../../types/shopping'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SectionGroup = {
  key: string
  title: string
  /** Emoji displayed in the section header (aisle mode only). */
  emoji?: string
  items: ShoppingItem[]
}

type SortMode = 'recipe' | 'aisle'

// ---------------------------------------------------------------------------
// Aisle emoji map
// ---------------------------------------------------------------------------

const AISLE_EMOJI: Record<string, string> = {
  'Meat & Seafood': '🥩',
  Produce: '🥬',
  Dairy: '🥛',
  'Canned & Dry Goods': '🥫',
  'Condiments & Sauces': '🍶',
  'Spices & Herbs': '🌿',
  Bakery: '🍞',
  Frozen: '🧊',
  Beverages: '🥤',
  'Snacks & Sweets': '🍫',
  Other: '🛒',
}

function aisleEmoji(aisle: string): string {
  return AISLE_EMOJI[aisle] ?? '🛒'
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByRecipe(list: ShoppingList): SectionGroup[] {
  const map = new Map<string, SectionGroup>()
  for (const item of list) {
    const existing = map.get(item.recipeId)
    if (existing) {
      existing.items.push(item)
    } else {
      map.set(item.recipeId, {
        key: item.recipeId,
        title: item.recipeTitle,
        items: [item],
      })
    }
  }
  return Array.from(map.values())
}

function groupByAisle(list: ShoppingList): SectionGroup[] {
  const map = new Map<string, SectionGroup>()
  for (const item of list) {
    const aisleKey = item.aisle || 'Other'
    const existing = map.get(aisleKey)
    if (existing) {
      existing.items.push(item)
    } else {
      map.set(aisleKey, {
        key: aisleKey,
        title: aisleKey,
        emoji: aisleEmoji(aisleKey),
        items: [item],
      })
    }
  }
  return Array.from(map.values())
}

function formatAmount(amount: string, unit: string): string {
  if (unit) return `${amount} ${unit}`
  return amount
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CartIcon() {
  return (
    <View className="w-24 h-24 rounded-full bg-bg-elevated items-center justify-center mb-4 border border-border-subtle">
      <Text className="text-4xl">🛒</Text>
    </View>
  )
}

function EmptyState({ onChatPress }: { onChatPress: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-16">
      <CartIcon />
      <Text className="text-xl font-semibold text-text text-center mb-2">
        Your list is empty
      </Text>
      <Text className="text-sm text-text-2 text-center leading-relaxed mb-6">
        Add ingredients from recipes in the chat
      </Text>

      {/* Divider */}
      <View className="flex-row items-center w-full mb-4">
        <View className="flex-1 h-px bg-border-subtle" />
        <Text className="text-sm text-text-3 font-medium mx-3">or</Text>
        <View className="flex-1 h-px bg-border-subtle" />
      </View>

      {/* Ghost button */}
      <TouchableOpacity
        onPress={onChatPress}
        className="flex-row items-center gap-1 py-2 px-4"
        accessibilityRole="button"
        accessibilityLabel="Chat with mise."
      >
        <Text className="text-base font-medium text-brand">
          Chat with mise.
        </Text>
        <Text className="text-brand text-base"> →</Text>
      </TouchableOpacity>
    </View>
  )
}

function SegmentedControl({
  value,
  onChange,
}: {
  value: SortMode
  onChange: (v: SortMode) => void
}) {
  return (
    <View className="flex-row rounded-md bg-bg-elevated border border-border overflow-hidden">
      <TouchableOpacity
        className={`flex-1 py-1.5 items-center ${value === 'recipe' ? 'bg-bg-surface' : 'bg-transparent'}`}
        onPress={() => onChange('recipe')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'recipe' }}
      >
        <Text
          className={`text-sm font-medium ${value === 'recipe' ? 'text-text' : 'text-text-3'}`}
        >
          By Recipe
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 py-1.5 items-center ${value === 'aisle' ? 'bg-bg-surface' : 'bg-transparent'}`}
        onPress={() => onChange('aisle')}
        accessibilityRole="button"
        accessibilityState={{ selected: value === 'aisle' }}
      >
        <Text
          className={`text-sm font-medium ${value === 'aisle' ? 'text-text' : 'text-text-3'}`}
        >
          By Aisle
        </Text>
      </TouchableOpacity>
    </View>
  )
}

function ItemRow({
  item,
  onToggle,
  showRecipe = false,
}: {
  item: ShoppingItem
  onToggle: (id: string) => void
  showRecipe?: boolean
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-border-subtle"
      onPress={() => onToggle(item.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.checked }}
      accessibilityLabel={item.name}
    >
      {/* Checkbox */}
      <View
        className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${
          item.checked
            ? 'bg-brand border-brand'
            : 'bg-transparent border-border-strong'
        }`}
      >
        {item.checked && (
          <Text className="text-text-inv text-xs font-bold">✓</Text>
        )}
      </View>

      {/* Ingredient name + optional recipe label */}
      <View className="flex-1">
        <Text
          className={`text-base ${item.checked ? 'text-text-3 line-through' : 'text-text'}`}
        >
          {item.name}
        </Text>
        {showRecipe && (
          <Text className="text-xs text-text-3 mt-0.5">{item.recipeTitle}</Text>
        )}
      </View>

      {/* Amount */}
      <Text
        className={`text-sm ${item.checked ? 'text-text-4' : 'text-text-2'}`}
      >
        {formatAmount(item.amount, item.unit)}
      </Text>
    </TouchableOpacity>
  )
}

function RecipeThumbnail({ title }: { title: string }) {
  // Derive a simple food emoji from the recipe title for the thumbnail placeholder
  const lower = title.toLowerCase()
  let emoji = '🍽️'
  if (lower.includes('chicken') || lower.includes('poultry')) emoji = '🍗'
  else if (lower.includes('beef') || lower.includes('steak')) emoji = '🥩'
  else if (
    lower.includes('fish') ||
    lower.includes('salmon') ||
    lower.includes('tuna')
  )
    emoji = '🐟'
  else if (lower.includes('pasta') || lower.includes('spaghetti')) emoji = '🍝'
  else if (lower.includes('pizza')) emoji = '🍕'
  else if (lower.includes('salad')) emoji = '🥗'
  else if (lower.includes('soup') || lower.includes('stew')) emoji = '🍲'
  else if (lower.includes('curry')) emoji = '🍛'
  else if (lower.includes('rice')) emoji = '🍚'
  else if (
    lower.includes('cake') ||
    lower.includes('dessert') ||
    lower.includes('sweet')
  )
    emoji = '🎂'

  return (
    <View className="w-8 h-8 rounded-md bg-bg-elevated items-center justify-center mr-2 overflow-hidden">
      <Text className="text-lg">{emoji}</Text>
    </View>
  )
}

function RecipeSectionHeader({ group }: { group: SectionGroup }) {
  return (
    <View className="flex-row items-center py-2">
      <RecipeThumbnail title={group.title} />
      <Text
        className="text-sm font-semibold text-text flex-1"
        numberOfLines={1}
      >
        {group.title}
      </Text>
      <Text className="text-sm text-text-3 ml-2">
        {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
      </Text>
    </View>
  )
}

function AisleSectionHeader({ group }: { group: SectionGroup }) {
  return (
    <View className="flex-row items-center py-2">
      <Text className="text-base mr-2">{group.emoji}</Text>
      <Text
        className="text-sm font-semibold text-text flex-1"
        numberOfLines={1}
      >
        {group.title}
      </Text>
      <Text className="text-sm text-text-3 ml-2">
        {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
      </Text>
    </View>
  )
}

function RecipeSection({
  group,
  onToggle,
}: {
  group: SectionGroup
  onToggle: (id: string) => void
}) {
  return (
    <View className="mb-4">
      <RecipeSectionHeader group={group} />
      {group.items.map((item) => (
        <ItemRow key={item.id} item={item} onToggle={onToggle} />
      ))}
    </View>
  )
}

function AisleSection({
  group,
  onToggle,
}: {
  group: SectionGroup
  onToggle: (id: string) => void
}) {
  return (
    <View className="mb-4">
      <AisleSectionHeader group={group} />
      {group.items.map((item) => (
        <ItemRow key={item.id} item={item} onToggle={onToggle} showRecipe />
      ))}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ShoppingScreen() {
  const router = useRouter()
  const [list, setList] = useState<ShoppingList>([])
  const [sortMode, setSortMode] = useState<SortMode>('recipe')
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let active = true
      setLoading(true)
      loadShoppingList()
        .then((loaded) => {
          if (active) {
            setList(loaded)
            setLoading(false)
          }
        })
        .catch(() => {
          if (active) setLoading(false)
        })
      return () => {
        active = false
      }
    }, [])
  )

  const handleToggle = useCallback(async (id: string) => {
    const updated = await toggleItem(id)
    setList(updated)
  }, [])

  const handleClearCompleted = useCallback(async () => {
    setClearing(true)
    const updated = await clearCompleted()
    setList(updated)
    setClearing(false)
  }, [])

  const handleChatPress = useCallback(() => {
    router.push('/(tabs)')
  }, [router])

  const isEmpty = list.length === 0
  const hasChecked = list.some((item) => item.checked)

  const groups =
    sortMode === 'recipe' ? groupByRecipe(list) : groupByAisle(list)

  const recipeCount = new Set(list.map((i) => i.recipeId)).size

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
      {/* App bar */}
      <View className="px-4 py-3 border-b border-border-subtle flex-row items-center justify-between">
        {isEmpty ? (
          <>
            <Text className="text-2xl font-black tracking-tighter text-text">
              mise<Text className="text-brand">.</Text>
            </Text>
            <Text className="text-base font-semibold text-text">Shopping</Text>
            <View className="w-8" />
          </>
        ) : (
          <>
            <Text className="text-base font-semibold text-text">Shopping</Text>
            <View className="flex-row items-center gap-2">
              <View className="bg-brand-light rounded-full px-2 py-0.5">
                <Text className="text-xs font-semibold text-brand">
                  {list.length} {list.length === 1 ? 'item' : 'items'} ·{' '}
                  {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isEmpty ? (
        <EmptyState onChatPress={handleChatPress} />
      ) : (
        <>
          {/* Sort toggle + metadata row */}
          <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
            <Text className="text-sm text-text-3">
              {list.length} {list.length === 1 ? 'item' : 'items'} ·{' '}
              {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
            </Text>
            <SegmentedControl value={sortMode} onChange={setSortMode} />
          </View>

          {/* Item list */}
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {sortMode === 'recipe'
              ? groups.map((group) => (
                  <RecipeSection
                    key={group.key}
                    group={group}
                    onToggle={handleToggle}
                  />
                ))
              : groups.map((group) => (
                  <AisleSection
                    key={group.key}
                    group={group}
                    onToggle={handleToggle}
                  />
                ))}
          </ScrollView>

          {/* Footer: Clear completed */}
          {hasChecked && (
            <View className="px-4 py-3 border-t border-border-subtle">
              <TouchableOpacity
                onPress={handleClearCompleted}
                disabled={clearing}
                className="items-center py-2"
                accessibilityRole="button"
                accessibilityLabel="Clear completed items"
              >
                {clearing ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text className="text-sm font-medium text-text-2">
                    Clear completed
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  )
}
