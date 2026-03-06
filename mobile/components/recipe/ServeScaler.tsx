import React, { memo } from 'react'
import { Pressable, Text, View } from 'react-native'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ServeScalerProps {
  servings: number
  onServingsChange: (n: number) => void
  min?: number
  max?: number
}

// ---------------------------------------------------------------------------
// ServeScaler
// ---------------------------------------------------------------------------

/**
 * ServeScaler
 *
 * A compact row control that lets the user increment or decrement the serving
 * count within [min, max].
 *
 * Layout:  [−]  {servings} servings  [+]
 *
 * Design reference: view-26.
 */
function ServeScaler({
  servings,
  onServingsChange,
  min = 1,
  max = 20,
}: ServeScalerProps) {
  const atMin = servings <= min
  const atMax = servings >= max

  function handleDecrement() {
    if (!atMin) onServingsChange(servings - 1)
  }

  function handleIncrement() {
    if (!atMax) onServingsChange(servings + 1)
  }

  return (
    <View testID="serve-scaler" className="flex-row items-center gap-2">
      {/* Minus button */}
      <Pressable
        testID="btn-decrement-servings"
        onPress={handleDecrement}
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

      {/* Servings label */}
      <Text
        testID="servings-label"
        className="text-sm font-medium text-text min-w-[80px] text-center"
      >
        {servings} servings
      </Text>

      {/* Plus button */}
      <Pressable
        testID="btn-increment-servings"
        onPress={handleIncrement}
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
  )
}

export default memo(ServeScaler)
