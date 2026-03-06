import React, { memo } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import type {
  CarouselRecipeItem,
  RecipeCarouselBlock,
} from '../../types/blocks'

interface Props {
  block: RecipeCarouselBlock
  onAction: (message: string) => void
  testID?: string
}

// Reuse the same emoji heuristic as RecipeCard for visual consistency.
function getRecipeEmoji(title: string, cuisine?: string): string {
  const haystack = `${title} ${cuisine ?? ''}`.toLowerCase()
  if (haystack.includes('chicken')) return '🍗'
  if (
    haystack.includes('fish') ||
    haystack.includes('seafood') ||
    haystack.includes('prawn')
  )
    return '🐟'
  if (haystack.includes('beef') || haystack.includes('steak')) return '🥩'
  if (haystack.includes('pasta') || haystack.includes('italian')) return '🍝'
  if (haystack.includes('salad')) return '🥗'
  if (haystack.includes('soup') || haystack.includes('broth')) return '🍜'
  if (
    haystack.includes('curry') ||
    haystack.includes('thai') ||
    haystack.includes('indian')
  )
    return '🍛'
  if (haystack.includes('pizza')) return '🍕'
  if (haystack.includes('rice')) return '🍚'
  if (haystack.includes('taco') || haystack.includes('mexican')) return '🌮'
  if (haystack.includes('chinese')) return '🥢'
  return '🍽️'
}

interface CardProps {
  item: CarouselRecipeItem
  onAction: (message: string) => void
}

function CarouselCard({ item, onAction }: CardProps) {
  const { title, cookTime, servings, cuisine } = item
  const emoji = getRecipeEmoji(title, cuisine)

  return (
    <Pressable
      testID={`carousel-card-${item.recipeId}`}
      className="w-48 rounded-xl overflow-hidden bg-bg-surface border border-border shadow-sm mr-3"
      onPress={() => onAction(`Show me ${title}`)}
      accessibilityRole="button"
      accessibilityLabel={`Show me ${title}`}
    >
      {/* Emoji hero */}
      <View
        className="h-28 items-center justify-center"
        style={{ backgroundColor: '#F0D5A8' }}
      >
        <View
          className="absolute inset-0 opacity-60"
          style={{ backgroundColor: '#8B5820' }}
        />
        <Text className="text-5xl z-10" accessibilityLabel={`${title} image`}>
          {emoji}
        </Text>
      </View>

      {/* Card body */}
      <View className="p-3 gap-2">
        {/* Cuisine tag pill */}
        {cuisine ? (
          <View className="self-start bg-brand/10 rounded-full px-2 py-0.5">
            <Text className="text-xs font-medium text-brand">{cuisine}</Text>
          </View>
        ) : null}

        {/* Title — max 2 lines */}
        <Text
          className="text-sm font-semibold text-text leading-snug"
          numberOfLines={2}
        >
          {title}
        </Text>

        {/* Meta row: time · servings */}
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-0.5">
            <Text className="text-xs text-text-3">⏱</Text>
            <Text className="text-xs text-text-2">{cookTime}</Text>
          </View>
          <Text className="text-text-4 text-xs">·</Text>
          <View className="flex-row items-center gap-0.5">
            <Text className="text-xs text-text-3">👤</Text>
            <Text className="text-xs text-text-2">
              {servings} {servings === 1 ? 'serving' : 'servings'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

/**
 * RecipeCarousel — horizontally scrollable row of compact recipe cards.
 * Matches view-04 mock. Tapping a card injects "Show me <title>" into chat.
 */
function RecipeCarousel({ block, onAction, testID }: Props) {
  const { items } = block.data

  return (
    <View testID={testID ?? 'recipe-carousel'}>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.recipeId}
        renderItem={({ item }) => (
          <CarouselCard item={item} onAction={onAction} />
        )}
        contentContainerClassName="px-0 py-1"
        // Ensure last card is not clipped
        ListFooterComponent={<View className="w-1" />}
      />
    </View>
  )
}

export default memo(RecipeCarousel)
