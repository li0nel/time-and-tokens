import React, { useState, useCallback } from 'react'
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import {
  loadShoppingList,
  toggleItem,
  clearCompleted,
} from '../../services/shopping'
import type { ShoppingItem, ShoppingList } from '../../types/shopping'
import AddRecipeSheet from '../../components/shopping/AddRecipeSheet'

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

function recipeTitleEmoji(title: string): string {
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

// ---------------------------------------------------------------------------
// In-Store Progress Bar
// ---------------------------------------------------------------------------

function InStoreProgressBar({
  checkedCount,
  totalCount,
}: {
  checkedCount: number
  totalCount: number
}) {
  const pct = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  return (
    <View className="flex-row items-center justify-between px-4 pt-2.5 pb-2">
      <Text className="text-sm font-semibold text-text-2">
        {checkedCount} of {totalCount} items
        {checkedCount === totalCount && totalCount > 0 ? ' ✓' : ''}
      </Text>
      {/* Fixed-width progress track */}
      <View
        className="h-1.5 rounded-full bg-bg-elevated overflow-hidden"
        style={{ width: 130 }}
      >
        <View
          className="h-full rounded-full bg-brand"
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  )
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

/**
 * Pill-style segmented control matching the sort-toggle mockup.
 * Outer container: rounded-full bg-bg-elevated border border-border
 * Active pill: bg-bg-surface shadow-xs rounded-full
 */
function SegmentedControl({
  value,
  onChange,
}: {
  value: SortMode
  onChange: (v: SortMode) => void
}) {
  return (
    <View
      className="flex-row rounded-full bg-bg-elevated border border-border"
      style={{ padding: 3, gap: 2 }}
    >
      <TouchableOpacity
        className={`rounded-full px-4 ${value === 'recipe' ? 'bg-bg-surface shadow-xs' : ''}`}
        style={{ paddingVertical: 7 }}
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
        className={`rounded-full px-4 ${value === 'aisle' ? 'bg-bg-surface shadow-xs' : ''}`}
        style={{ paddingVertical: 7 }}
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

/**
 * Single shopping item row matching view-37 shop-item structure.
 * Checkbox is 22×22 rounded-full with border-2.
 * Amount appears below the name inside shop-item-info.
 */
function ItemRow({
  item,
  onToggle,
  showRecipe = false,
  inStoreMode = false,
}: {
  item: ShoppingItem
  onToggle: (id: string) => void
  showRecipe?: boolean
  inStoreMode?: boolean
}) {
  return (
    <TouchableOpacity
      className={`flex-row items-center gap-3 py-3 border-b border-border-subtle ${item.checked && inStoreMode ? 'opacity-50' : ''}`}
      onPress={() => onToggle(item.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.checked }}
      accessibilityLabel={item.name}
    >
      {/* Checkbox — 22×22, rounded-full, border-2 */}
      <View
        className={`rounded-full border-2 items-center justify-center flex-shrink-0 ${
          item.checked ? 'bg-brand border-brand' : 'border-border-strong'
        }`}
        style={{ width: 22, height: 22 }}
      >
        {item.checked && (
          <Text className="text-text-inv text-xs font-bold">✓</Text>
        )}
      </View>

      {/* shop-item-info: name + amount stacked */}
      <View className="flex-1 min-w-0">
        <Text
          className={`text-sm font-medium ${item.checked ? 'text-text-3 line-through' : 'text-text'}`}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text className="text-[11px] text-text-3 mt-0.5">
          {formatAmount(item.amount, item.unit)}
        </Text>
        {showRecipe && (
          <Text className="text-[11px] text-text-4 mt-0.5">
            {item.recipeTitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

/**
 * Section header for "By Recipe" mode matching view-37 shop-section-head.
 * Shows a 32×32 emoji thumbnail + recipe title + item count.
 */
function RecipeSectionHeader({
  group,
  inStoreMode,
}: {
  group: SectionGroup
  inStoreMode: boolean
}) {
  const allDone = inStoreMode && group.items.every((i) => i.checked)
  const checkedCount = group.items.filter((i) => i.checked).length

  return (
    <View
      className={`flex-row items-center gap-2 pb-1.5 border-b-2 border-border-subtle ${allDone ? 'opacity-60' : ''}`}
      style={{ paddingTop: 14 }}
    >
      {/* 32×32 emoji thumbnail */}
      <View
        className="bg-bg-elevated rounded-[8px] items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ width: 32, height: 32 }}
      >
        <Text style={{ fontSize: 16 }}>{recipeTitleEmoji(group.title)}</Text>
      </View>

      <Text
        className={`text-sm font-bold flex-1 ${allDone ? 'text-text-3' : 'text-text'}`}
        numberOfLines={1}
      >
        {allDone ? '✓ ' : ''}
        {group.title}
      </Text>

      {inStoreMode ? (
        <Text
          className={`text-[11px] ${allDone ? 'text-brand font-semibold' : 'text-text-3'}`}
        >
          {allDone ? 'all done' : `${checkedCount} of ${group.items.length}`}
        </Text>
      ) : (
        <Text className="text-[11px] text-text-3">
          {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
        </Text>
      )}
    </View>
  )
}

/**
 * Section header for "By Aisle" mode matching view-39 shop-section-head.
 * Shows an emoji icon instead of a thumbnail box.
 */
function AisleSectionHeader({
  group,
  inStoreMode,
}: {
  group: SectionGroup
  inStoreMode: boolean
}) {
  const allDone = inStoreMode && group.items.every((i) => i.checked)
  const checkedCount = group.items.filter((i) => i.checked).length

  return (
    <View
      className={`flex-row items-center gap-2 pb-1.5 border-b-2 border-border-subtle ${allDone ? 'opacity-60' : ''}`}
      style={{ paddingTop: 14 }}
    >
      {/* shop-section-icon: 32px wide text-center emoji */}
      <Text
        className="text-base text-center flex-shrink-0"
        style={{ width: 32 }}
      >
        {group.emoji}
      </Text>

      <Text
        className={`text-sm font-bold flex-1 ${allDone ? 'text-text-3' : 'text-text'}`}
        numberOfLines={1}
      >
        {allDone ? '✓ ' : ''}
        {group.title}
      </Text>

      {inStoreMode ? (
        <Text
          className={`text-[11px] ${allDone ? 'text-brand font-semibold' : 'text-text-3'}`}
        >
          {allDone ? 'all done' : `${checkedCount} of ${group.items.length}`}
        </Text>
      ) : (
        <Text className="text-[11px] text-text-3">
          {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
        </Text>
      )}
    </View>
  )
}

function RecipeSection({
  group,
  onToggle,
  inStoreMode,
}: {
  group: SectionGroup
  onToggle: (id: string) => void
  inStoreMode: boolean
}) {
  return (
    <View className="mb-4">
      <RecipeSectionHeader group={group} inStoreMode={inStoreMode} />
      {group.items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onToggle={onToggle}
          inStoreMode={inStoreMode}
        />
      ))}
    </View>
  )
}

function AisleSection({
  group,
  onToggle,
  inStoreMode,
}: {
  group: SectionGroup
  onToggle: (id: string) => void
  inStoreMode: boolean
}) {
  return (
    <View className="mb-4">
      <AisleSectionHeader group={group} inStoreMode={inStoreMode} />
      {group.items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onToggle={onToggle}
          showRecipe
          inStoreMode={inStoreMode}
        />
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
  const [inStoreMode, setInStoreMode] = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)

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

  // AddRecipeSheet callback — no-op for MVP (recipes are already in the list)
  const handleAddRecipe = useCallback((_recipeId: string) => {
    // Future: scroll to or highlight the selected recipe section
  }, [])

  const isEmpty = list.length === 0
  const hasChecked = list.some((item) => item.checked)

  const checkedCount = list.filter((item) => item.checked).length
  const totalCount = list.length

  const groups =
    sortMode === 'recipe' ? groupByRecipe(list) : groupByAisle(list)

  const recipeCount = new Set(list.map((i) => i.recipeId)).size

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
      {/* App bar — always shows "Shopping List" + filter icon */}
      <View className="px-4 py-3 border-b border-border-subtle flex-row items-center justify-between">
        <View style={{ width: 32 }} />
        <Text className="text-[17px] font-bold tracking-tight text-text">
          Shopping List
        </Text>
        <Pressable
          style={{
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Filter"
        >
          <Feather name="sliders" size={20} color="#1C1917" />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isEmpty ? (
        <EmptyState onChatPress={handleChatPress} />
      ) : (
        <>
          {/* In-store progress bar */}
          {inStoreMode && (
            <InStoreProgressBar
              checkedCount={checkedCount}
              totalCount={totalCount}
            />
          )}

          {/* Sort toggle + metadata row */}
          <View className="px-4 pt-3 pb-2 flex-row items-center justify-between">
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <Text className="text-sm text-text-3">
                {list.length} {list.length === 1 ? 'item' : 'items'} ·{' '}
                {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
              </Text>
              {/* In-store mode toggle */}
              <TouchableOpacity
                onPress={() => setInStoreMode((prev) => !prev)}
                className={`flex-row items-center rounded-full px-2 border ${
                  inStoreMode
                    ? 'bg-brand border-brand'
                    : 'bg-transparent border-border-strong'
                }`}
                style={{ gap: 4, paddingVertical: 2 }}
                accessibilityRole="button"
                accessibilityState={{ selected: inStoreMode }}
                accessibilityLabel="Toggle in-store mode"
              >
                <Text style={{ fontSize: 12 }}>🛒</Text>
                <Text
                  className={`text-xs font-semibold ${inStoreMode ? 'text-text-inv' : 'text-text-2'}`}
                >
                  Shop
                </Text>
              </TouchableOpacity>
            </View>
            <SegmentedControl value={sortMode} onChange={setSortMode} />
          </View>

          {/* Item list */}
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {sortMode === 'recipe'
              ? groups.map((group) => (
                  <RecipeSection
                    key={group.key}
                    group={group}
                    onToggle={handleToggle}
                    inStoreMode={inStoreMode}
                  />
                ))
              : groups.map((group) => (
                  <AisleSection
                    key={group.key}
                    group={group}
                    onToggle={handleToggle}
                    inStoreMode={inStoreMode}
                  />
                ))}
          </ScrollView>

          {/* Sticky footer: Add Recipe + optional Clear Completed */}
          <View
            className="border-t border-border-subtle bg-bg px-4 pt-3"
            style={{ paddingBottom: 34 }}
          >
            {hasChecked && (
              <TouchableOpacity
                onPress={handleClearCompleted}
                disabled={clearing}
                className="items-center py-1 mb-2"
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
            )}
            <TouchableOpacity
              onPress={() => setShowAddSheet(true)}
              className="py-3 bg-brand rounded-full items-center"
              accessibilityRole="button"
              accessibilityLabel="Add recipe to shopping list"
            >
              <Text className="text-[15px] font-semibold text-text-inv">
                + Add Recipe
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <AddRecipeSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onAdd={handleAddRecipe}
      />
    </SafeAreaView>
  )
}
