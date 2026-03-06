import React, { memo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { RecipeCardBlock } from '../../types/blocks'

interface Props {
  block: RecipeCardBlock
  onAction: (message: string) => void
  testID?: string
}

const DIFFICULTY_STARS: Record<RecipeCardBlock['data']['difficulty'], number> =
  {
    easy: 1,
    medium: 2,
    hard: 3,
  }

const DIFFICULTY_LABELS: Record<RecipeCardBlock['data']['difficulty'], string> =
  {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  }

// Simple emoji selection based on cuisine / title keywords
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
  return '🍽️'
}

/**
 * RecipeCard — inline chat widget matching view-03 mock.
 * Shows a gradient hero with emoji, recipe name, difficulty stars,
 * meta row (time / servings / cuisine), description, and two action buttons.
 */
function RecipeCard({ block, onAction, testID }: Props) {
  const {
    recipeId,
    title,
    description,
    cookTime,
    servings,
    difficulty,
    cuisine,
    imageUrl,
  } = block.data
  const stars = DIFFICULTY_STARS[difficulty]
  const emoji = getRecipeEmoji(title, cuisine)

  function handleViewFullRecipe() {
    router.push({
      pathname: '/(tabs)/recipe/[id]',
      params: {
        id: recipeId,
        title,
        description: description ?? '',
        cookTime,
        servings: String(servings),
        difficulty,
        cuisine: cuisine ?? '',
        imageUrl: imageUrl ?? '',
      },
    })
  }

  return (
    <View
      testID={testID ?? 'recipe-card'}
      className="rounded-xl overflow-hidden bg-bg-surface border border-border shadow-sm"
    >
      {/* Hero gradient area with emoji */}
      <View
        className="h-24 items-center justify-center"
        style={{ backgroundColor: '#D4A050' }}
      >
        {/* Gradient overlay via nested views — NativeWind doesn't expose LinearGradient */}
        <View
          className="absolute inset-0"
          style={{ backgroundColor: '#F0D5A8' }}
        />
        <View
          className="absolute inset-0 opacity-60"
          style={{ backgroundColor: '#8B5820' }}
        />
        <Text className="text-4xl z-10" accessibilityLabel={`${title} hero`}>
          {emoji}
        </Text>
      </View>

      {/* Card body */}
      <View className="p-4 gap-3">
        {/* Title */}
        <Text
          className="text-lg font-semibold text-text leading-tight"
          numberOfLines={2}
        >
          {title}
        </Text>

        {/* Difficulty stars row */}
        <View className="flex-row items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Text
              key={i}
              testID={`star-${i}`}
              className={i < stars ? 'text-amber-400' : 'text-text-4'}
              style={{ fontSize: 14 }}
            >
              ★
            </Text>
          ))}
          <Text className="text-sm text-text-2 ml-1">
            {DIFFICULTY_LABELS[difficulty]}
          </Text>
        </View>

        {/* Meta row: time | servings | cuisine */}
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-text-3">⏱</Text>
            <Text className="text-sm text-text-2">{cookTime}</Text>
          </View>
          <Text className="text-text-4">·</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-xs text-text-3">👤</Text>
            <Text className="text-sm text-text-2">
              {servings} {servings === 1 ? 'serving' : 'servings'}
            </Text>
          </View>
          {cuisine ? (
            <>
              <Text className="text-text-4">·</Text>
              <Text className="text-sm text-text-2">{cuisine}</Text>
            </>
          ) : null}
        </View>

        {/* Description */}
        {description ? (
          <Text className="text-sm text-text-2 leading-snug" numberOfLines={3}>
            {description}
          </Text>
        ) : null}

        {/* Action buttons */}
        <View className="flex-row gap-2 mt-1">
          <Pressable
            testID="btn-start-cooking"
            className="flex-1 py-2.5 rounded-lg bg-brand items-center justify-center"
            onPress={() => onAction(`Start cooking ${title}`)}
            accessibilityRole="button"
            accessibilityLabel={`Start cooking ${title}`}
          >
            <Text className="text-sm font-semibold text-white">
              Start Cooking
            </Text>
          </Pressable>

          <Pressable
            testID="btn-view-full-recipe"
            className="flex-1 py-2.5 rounded-lg border border-brand items-center justify-center"
            onPress={handleViewFullRecipe}
            accessibilityRole="button"
            accessibilityLabel={`View full recipe for ${title}`}
          >
            <Text className="text-sm font-semibold text-brand">
              View Full Recipe
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

export default memo(RecipeCard)
