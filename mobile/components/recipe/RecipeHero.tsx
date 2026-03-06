import React, { memo } from 'react'
import { Image, Pressable, Text, View } from 'react-native'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecipeHeroProps {
  title: string
  subtitle?: string // e.g. foreign language name
  cuisine?: string
  imageUrl?: string // remote or local URI
  prepTime?: string // e.g. "15 min"
  cookTime?: string // e.g. "30 min"
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  onBack?: () => void
  onShare?: () => void
  onFavorite?: () => void
  isFavorited?: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIFFICULTY_STARS: Record<RecipeHeroProps['difficulty'], number> = {
  easy: 1,
  medium: 2,
  hard: 3,
}

const DIFFICULTY_LABELS: Record<RecipeHeroProps['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

// ---------------------------------------------------------------------------
// Emoji placeholder logic (mirrors RecipeCard)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Gradient overlay simulation: three absolutely-positioned layers at the bottom
 * of the image with increasing opacity, from transparent at top to near-black
 * at bottom — matches the design in view-22 and view-26.
 */
function GradientOverlay() {
  return (
    <>
      {/* Layer 1 — lightest, tallest */}
      <View
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: 160,
          backgroundColor: 'rgba(0,0,0,0.15)',
          pointerEvents: 'none',
        }}
      />
      {/* Layer 2 — mid opacity */}
      <View
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: 110,
          backgroundColor: 'rgba(0,0,0,0.28)',
          pointerEvents: 'none',
        }}
      />
      {/* Layer 3 — darkest, thinnest — creates the heavy base */}
      <View
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: 60,
          backgroundColor: 'rgba(0,0,0,0.35)',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

/** Circular frosted-glass icon button used in the hero overlay */
function HeroIconButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress?: () => void
  accessibilityLabel: string
  children: React.ReactNode
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="items-center justify-center rounded-full"
      style={{ width: 36, height: 36, backgroundColor: 'rgba(0,0,0,0.38)' }}
    >
      {children}
    </Pressable>
  )
}

/**
 * Difficulty chip showing stars + label, used in the meta bar.
 * Matches the star pattern from RecipeCard.
 */
function DifficultyChip({
  difficulty,
}: {
  difficulty: RecipeHeroProps['difficulty']
}) {
  const stars = DIFFICULTY_STARS[difficulty]
  const label = DIFFICULTY_LABELS[difficulty]

  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <Text
          key={i}
          className={i < stars ? 'text-amber-400' : 'text-text-4'}
          style={{ fontSize: 11 }}
        >
          ★
        </Text>
      ))}
      <Text className="text-xs text-text-3 ml-1">{label}</Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Meta bar divider
// ---------------------------------------------------------------------------

function MetaDivider() {
  return <View className="w-px self-stretch bg-border-subtle mx-2" />
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * RecipeHero
 *
 * Full-width hero image (4:3 aspect ratio) with gradient overlay, overlay
 * action buttons (back / share / heart), and the recipe title block overlaid
 * on the bottom of the image. Below the image: a RecipeMeta bar with prep
 * time, cook time, servings and difficulty.
 *
 * Design reference: view-22-recipe-instructions-tab, view-26-recipe-massaman-long.
 *
 * Styling: NativeWind only (no StyleSheet). LinearGradient is simulated with
 * nested Views at increasing opacity.
 */
function RecipeHero({
  title,
  subtitle,
  cuisine,
  imageUrl,
  prepTime,
  cookTime,
  servings,
  difficulty,
  onBack,
  onShare,
  onFavorite,
  isFavorited = false,
}: RecipeHeroProps) {
  const emoji = getRecipeEmoji(title, cuisine)

  return (
    <View testID="recipe-hero">
      {/* ----------------------------------------------------------------
          HERO IMAGE SECTION — 4:3 aspect ratio
          aspectRatio via inline style: NativeWind fractional ratios are
          unreliable on React Native (RN expects a number, not a string).
      ---------------------------------------------------------------- */}
      <View className="w-full overflow-hidden" style={{ aspectRatio: 4 / 3 }}>
        {/* Background / image */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="absolute inset-0 w-full h-full"
            style={{ resizeMode: 'cover' }}
            accessibilityLabel={`${title} hero image`}
          />
        ) : (
          // Emoji placeholder — warm gradient background matching RecipeCard
          <>
            <View
              className="absolute inset-0"
              style={{ backgroundColor: '#F0D5A8' }}
            />
            <View
              className="absolute inset-0 opacity-60"
              style={{ backgroundColor: '#8B5820' }}
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text
                style={{ fontSize: 80 }}
                accessibilityLabel={`${title} placeholder`}
              >
                {emoji}
              </Text>
            </View>
          </>
        )}

        {/* Gradient overlay simulation */}
        <GradientOverlay />

        {/* ---- Top action bar (back left, share+heart right) ---- */}
        <View
          className="absolute left-0 right-0 flex-row items-center justify-between"
          style={{ top: 14, paddingHorizontal: 14 }}
        >
          {/* Back button */}
          <HeroIconButton onPress={onBack} accessibilityLabel="Go back">
            <Text
              className="text-white font-semibold"
              style={{ fontSize: 18, lineHeight: 20 }}
            >
              ←
            </Text>
          </HeroIconButton>

          {/* Share + Favourite buttons */}
          <View className="flex-row gap-2">
            <HeroIconButton onPress={onShare} accessibilityLabel="Share recipe">
              {/* Share icon — three circles connected */}
              <Text className="text-white" style={{ fontSize: 15 }}>
                ⬆
              </Text>
            </HeroIconButton>

            <HeroIconButton
              onPress={onFavorite}
              accessibilityLabel={
                isFavorited ? 'Remove from favourites' : 'Add to favourites'
              }
            >
              <Text
                style={{
                  fontSize: 15,
                  color: isFavorited ? '#F87171' : '#ffffff',
                }}
              >
                {isFavorited ? '♥' : '♡'}
              </Text>
            </HeroIconButton>
          </View>
        </View>

        {/* ---- Title block overlaid at bottom of image ---- */}
        <View
          className="absolute left-0 right-0 bottom-0"
          style={{ padding: 20, paddingBottom: 16 }}
        >
          {/* Cuisine tag pill */}
          {cuisine ? (
            <View
              className="self-start rounded-full mb-2"
              style={{
                paddingHorizontal: 9,
                paddingVertical: 3,
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: 0.2 }}
              >
                {cuisine}
              </Text>
            </View>
          ) : null}

          {/* Recipe title */}
          <Text
            testID="recipe-hero-title"
            className="font-black text-white leading-tight"
            style={{
              fontSize: 26,
              letterSpacing: -0.8,
              textShadowColor: 'rgba(0,0,0,0.3)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}
            numberOfLines={3}
          >
            {title}
          </Text>

          {/* Optional foreign language subtitle */}
          {subtitle ? (
            <Text
              className="text-sm italic mt-1"
              style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {/* ----------------------------------------------------------------
          RECIPE META BAR
          Flex row with thin vertical dividers: prep | cook | servings | difficulty
      ---------------------------------------------------------------- */}
      <View
        className="flex-row border-b border-border-subtle"
        testID="recipe-meta-bar"
      >
        {/* Prep time */}
        {prepTime ? (
          <>
            <View className="flex-1 items-center py-4 px-2">
              <Text
                className="text-xl font-black text-text"
                style={{ letterSpacing: -0.5 }}
              >
                {prepTime}
              </Text>
              <Text
                className="text-xs text-text-3 mt-0.5 uppercase"
                style={{ letterSpacing: 0.4 }}
              >
                Min Prep
              </Text>
            </View>
            <MetaDivider />
          </>
        ) : null}

        {/* Cook time */}
        {cookTime ? (
          <>
            <View className="flex-1 items-center py-4 px-2">
              <Text
                className="text-xl font-black text-text"
                style={{ letterSpacing: -0.5 }}
              >
                {cookTime}
              </Text>
              <Text
                className="text-xs text-text-3 mt-0.5 uppercase"
                style={{ letterSpacing: 0.4 }}
              >
                Min Cook
              </Text>
            </View>
            <MetaDivider />
          </>
        ) : null}

        {/* Servings */}
        <View className="flex-1 items-center py-4 px-2">
          <Text
            className="text-xl font-black text-text"
            style={{ letterSpacing: -0.5 }}
          >
            {servings}
          </Text>
          <Text
            className="text-xs text-text-3 mt-0.5 uppercase"
            style={{ letterSpacing: 0.4 }}
          >
            Serves
          </Text>
        </View>

        <MetaDivider />

        {/* Difficulty */}
        <View className="flex-1 items-center justify-center py-4 px-2">
          <DifficultyChip difficulty={difficulty} />
          <Text
            className="text-xs text-text-3 mt-0.5 uppercase"
            style={{ letterSpacing: 0.4 }}
          >
            Level
          </Text>
        </View>
      </View>
    </View>
  )
}

export default memo(RecipeHero)
