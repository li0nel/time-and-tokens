import React, { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'

import RecipeHero from '../../../components/recipe/RecipeHero'
import RecipeInstructions from '../../../components/recipe/RecipeInstructions'
import type { RecipeStep } from '../../../components/recipe/RecipeInstructions'
import ServeScaler from '../../../components/recipe/ServeScaler'
import UnitToggle from '../../../components/recipe/UnitToggle'
import type { UnitSystem } from '../../../components/recipe/UnitToggle'
import AddToListSheet from '../../../components/recipe/AddToListSheet'
import type { Ingredient, CookStep } from '../../../types/blocks'
import { scaleIngredientAmount, convertUnit } from '../../../utils/recipeUtils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecipeParams {
  id?: string | string[]
  title?: string | string[]
  description?: string | string[]
  cookTime?: string | string[]
  prepTime?: string | string[]
  servings?: string | string[]
  difficulty?: string | string[]
  cuisine?: string | string[]
  imageUrl?: string | string[]
  /** JSON string: Ingredient[] */
  ingredients?: string | string[]
  /** JSON string: CookStep[] */
  steps?: string | string[]
}

type ActiveTab = 'ingredients' | 'instructions'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseDifficulty(raw: string): 'easy' | 'medium' | 'hard' {
  if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw
  return 'easy'
}

function parseIngredients(raw: string | undefined): Ingredient[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as Ingredient[]
  } catch {
    // Malformed JSON — fall through
  }
  return []
}

function parseCookSteps(raw: string | undefined): CookStep[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as CookStep[]
  } catch {
    // Malformed JSON — fall through
  }
  return []
}

/** Convert CookStep[] to RecipeStep[] (they share the same shape) */
function cookStepsToRecipeSteps(steps: CookStep[]): RecipeStep[] {
  return steps.map((s) => ({
    stepNumber: s.stepNumber,
    instruction: s.instruction,
    time: s.time,
    tip: s.tip,
    warning: s.warning,
  }))
}

// ---------------------------------------------------------------------------
// Tab bar sub-component
// ---------------------------------------------------------------------------

interface TabBarProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <View
      testID="recipe-detail-tabs"
      className="flex-row border-b border-border-subtle bg-bg"
    >
      <Pressable
        testID="tab-ingredients"
        onPress={() => onTabChange('ingredients')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'ingredients' }}
        className="flex-1 items-center py-3"
      >
        <Text
          className={`text-sm font-semibold ${
            activeTab === 'ingredients' ? 'text-brand' : 'text-text-3'
          }`}
        >
          Ingredients
        </Text>
        {activeTab === 'ingredients' && (
          <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
        )}
      </Pressable>

      <Pressable
        testID="tab-instructions"
        onPress={() => onTabChange('instructions')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'instructions' }}
        className="flex-1 items-center py-3"
      >
        <Text
          className={`text-sm font-semibold ${
            activeTab === 'instructions' ? 'text-brand' : 'text-text-3'
          }`}
        >
          Instructions
        </Text>
        {activeTab === 'instructions' && (
          <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
        )}
      </Pressable>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Ingredient row sub-component
// ---------------------------------------------------------------------------

interface IngredientRowProps {
  ingredient: Ingredient
  baseServings: number
  scaledServings: number
  unitSystem: UnitSystem
}

function IngredientRow({
  ingredient,
  baseServings,
  scaledServings,
  unitSystem,
}: IngredientRowProps) {
  const scaledAmount = scaleIngredientAmount(
    ingredient.amount,
    baseServings,
    scaledServings
  )
  const converted = convertUnit(scaledAmount, ingredient.unit, unitSystem)

  return (
    <View className="flex-row items-center py-3 border-b border-border-subtle">
      {/* Bullet */}
      <View className="w-1.5 h-1.5 rounded-full bg-brand mr-3 flex-shrink-0 mt-0.5" />

      {/* Name + optional note */}
      <View className="flex-1">
        <Text className="text-sm text-text">{ingredient.name}</Text>
        {ingredient.note ? (
          <Text className="text-xs text-text-3 mt-0.5">{ingredient.note}</Text>
        ) : null}
      </View>

      {/* Scaled + converted amount */}
      <Text className="text-sm font-semibold text-text ml-3 flex-shrink-0">
        {converted.amount} {converted.unit}
      </Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function RecipeDetailScreen() {
  const rawParams = useLocalSearchParams()
  const params = rawParams as RecipeParams

  // Parse params defensively
  const recipeId = (Array.isArray(params.id) ? params.id[0] : params.id) ?? ''
  const title =
    (Array.isArray(params.title) ? params.title[0] : params.title) ?? 'Recipe'
  const description = Array.isArray(params.description)
    ? params.description[0]
    : params.description
  const cookTime = Array.isArray(params.cookTime)
    ? params.cookTime[0]
    : params.cookTime
  const prepTime = Array.isArray(params.prepTime)
    ? params.prepTime[0]
    : params.prepTime
  const rawServings = Array.isArray(params.servings)
    ? params.servings[0]
    : params.servings
  const baseServings = Math.max(1, parseInt(rawServings ?? '2', 10) || 2)
  const rawDifficulty = Array.isArray(params.difficulty)
    ? params.difficulty[0]
    : params.difficulty
  const difficulty = parseDifficulty(rawDifficulty ?? 'easy')
  const cuisine = Array.isArray(params.cuisine)
    ? params.cuisine[0]
    : params.cuisine
  const imageUrl = Array.isArray(params.imageUrl)
    ? params.imageUrl[0]
    : params.imageUrl
  const ingredients = parseIngredients(
    Array.isArray(params.ingredients)
      ? params.ingredients[0]
      : params.ingredients
  )
  const cookSteps = parseCookSteps(
    Array.isArray(params.steps) ? params.steps[0] : params.steps
  )
  const recipeSteps = cookStepsToRecipeSteps(cookSteps)

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [activeTab, setActiveTab] = useState<ActiveTab>('ingredients')
  const [scaledServings, setScaledServings] = useState<number>(baseServings)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
  const [sheetVisible, setSheetVisible] = useState(false)

  // ---------------------------------------------------------------------------
  // Navigation handlers
  // ---------------------------------------------------------------------------

  function handleBack() {
    router.back()
  }

  function handleStartCookMode() {
    router.push({
      pathname: '/(tabs)/cook/[id]',
      params: {
        id: recipeId,
        recipeTitle: title,
        steps: JSON.stringify(cookSteps),
      },
    })
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
      <ScrollView
        testID="recipe-detail-screen"
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero */}
        <RecipeHero
          title={title}
          subtitle={description}
          cuisine={cuisine}
          imageUrl={imageUrl}
          prepTime={prepTime}
          cookTime={cookTime}
          servings={baseServings}
          difficulty={difficulty}
          onBack={handleBack}
        />

        {/* Tab bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab content */}
        <View className="px-4 pt-4">
          {activeTab === 'ingredients' ? (
            /* ---- INGREDIENTS TAB ---- */
            <View testID="tab-content-ingredients">
              {/* Controls row: ServeScaler + UnitToggle */}
              <View className="flex-row items-center justify-between mb-4">
                <ServeScaler
                  servings={scaledServings}
                  onServingsChange={setScaledServings}
                />
                <UnitToggle unit={unitSystem} onUnitChange={setUnitSystem} />
              </View>

              {/* Ingredient list */}
              {ingredients.length > 0 ? (
                <View testID="ingredient-list">
                  {ingredients.map((ingredient, index) => (
                    <IngredientRow
                      key={`${ingredient.name}-${index}`}
                      ingredient={ingredient}
                      baseServings={baseServings}
                      scaledServings={scaledServings}
                      unitSystem={unitSystem}
                    />
                  ))}
                </View>
              ) : (
                <View className="items-center py-8">
                  <Text className="text-4xl mb-2">🥘</Text>
                  <Text className="text-sm text-text-3 text-center">
                    No ingredients listed for this recipe.
                  </Text>
                </View>
              )}

              {/* Add All to List button */}
              {ingredients.length > 0 && (
                <Pressable
                  testID="btn-add-all-to-list"
                  className="mt-6 py-3.5 rounded-xl bg-brand items-center justify-center"
                  onPress={() => setSheetVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add all ingredients to shopping list"
                >
                  <Text className="text-base font-semibold text-white">
                    Add All to List →
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            /* ---- INSTRUCTIONS TAB ---- */
            <View testID="tab-content-instructions">
              <RecipeInstructions
                steps={recipeSteps}
                recipeTitle={title}
                onStartCookMode={handleStartCookMode}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to List sheet */}
      <AddToListSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        recipeTitle={title}
        recipeId={recipeId}
        servings={scaledServings}
        ingredients={ingredients}
      />
    </SafeAreaView>
  )
}
