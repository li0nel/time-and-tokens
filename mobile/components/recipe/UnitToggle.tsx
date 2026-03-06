import React, { memo } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { UnitSystem } from '../../utils/recipeUtils'

// Re-export so consumers can import from a single recipe location if preferred.
export type { UnitSystem }

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnitToggleProps {
  unit: UnitSystem
  onUnitChange: (unit: UnitSystem) => void
}

// ---------------------------------------------------------------------------
// UnitToggle
// ---------------------------------------------------------------------------

/**
 * UnitToggle
 *
 * A two-segment segmented control for switching between metric and imperial
 * unit systems.
 *
 * Active segment:   brand background + white text
 * Inactive segment: bg-surface + text-2 color
 *
 * Design reference: view-26.
 */
function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  return (
    <View
      testID="unit-toggle"
      className="flex-row rounded-lg overflow-hidden border border-border bg-bg-surface"
    >
      {/* Metric segment */}
      <Pressable
        testID="unit-toggle-metric"
        onPress={() => onUnitChange('metric')}
        accessibilityRole="button"
        accessibilityLabel="Switch to metric units"
        accessibilityState={{ selected: unit === 'metric' }}
        className={`flex-1 items-center justify-center py-1.5 px-3 ${
          unit === 'metric' ? 'bg-brand' : 'bg-bg-surface'
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            unit === 'metric' ? 'text-white' : 'text-text-2'
          }`}
        >
          Metric
        </Text>
      </Pressable>

      {/* Imperial segment */}
      <Pressable
        testID="unit-toggle-imperial"
        onPress={() => onUnitChange('imperial')}
        accessibilityRole="button"
        accessibilityLabel="Switch to imperial units"
        accessibilityState={{ selected: unit === 'imperial' }}
        className={`flex-1 items-center justify-center py-1.5 px-3 ${
          unit === 'imperial' ? 'bg-brand' : 'bg-bg-surface'
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            unit === 'imperial' ? 'text-white' : 'text-text-2'
          }`}
        >
          Imperial
        </Text>
      </Pressable>
    </View>
  )
}

export default memo(UnitToggle)
