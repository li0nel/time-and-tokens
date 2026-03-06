import React, { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export interface RecipeStep {
  stepNumber: number
  instruction: string
  tip?: string
  warning?: string
  time?: string
}

export interface RecipeInstructionsProps {
  steps: RecipeStep[]
  recipeTitle: string
  onStartCookMode?: () => void
}

interface StepItemProps {
  step: RecipeStep
}

/**
 * Renders a single numbered instruction step with optional time pill,
 * tip box (blue), and warning box (amber).
 */
function StepItem({ step }: StepItemProps) {
  const { stepNumber, instruction, time, tip, warning } = step

  return (
    <View className="flex-row gap-3 mb-6">
      {/* Step number circle */}
      <View className="w-8 h-8 rounded-full bg-brand items-center justify-center flex-shrink-0 mt-0.5">
        <Text className="text-sm font-bold text-white">{stepNumber}</Text>
      </View>

      {/* Step content */}
      <View className="flex-1 gap-2">
        {/* Instruction text */}
        <Text className="text-base text-text leading-snug">{instruction}</Text>

        {/* Optional time pill */}
        {time != null ? (
          <View className="self-start flex-row items-center gap-1.5 bg-warning-bg border border-warning rounded-full px-3 py-1">
            <Text className="text-xs text-warning">⏱</Text>
            <Text className="text-xs font-semibold text-warning">{time}</Text>
          </View>
        ) : null}

        {/* Optional tip box — blue info box */}
        {tip != null ? (
          <View className="flex-row items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <Text className="text-sm flex-shrink-0 mt-0.5">ℹ️</Text>
            <Text className="text-xs text-info leading-snug flex-1">{tip}</Text>
          </View>
        ) : null}

        {/* Optional warning box — amber warning box */}
        {warning != null ? (
          <View className="flex-row items-start gap-2 bg-warning-bg border border-warning rounded-lg px-3 py-2">
            <Text className="text-sm flex-shrink-0 mt-0.5">⚠️</Text>
            <Text className="text-xs text-warning leading-snug flex-1">
              {warning}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

/**
 * RecipeInstructions — ScrollView-compatible instructions tab component.
 *
 * Shows a Cook Mode promotional banner at the top, followed by a numbered
 * step list. Each step may include an optional time pill, tip (blue info
 * box), or warning (amber warning box). Designed for view-22.
 */
function RecipeInstructions({
  steps,
  recipeTitle,
  onStartCookMode,
}: RecipeInstructionsProps) {
  return (
    <View testID="recipe-instructions">
      {/* Cook Mode promotional banner */}
      <TouchableOpacity
        testID="cook-mode-banner"
        className="flex-row items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-muted rounded-lg mb-6"
        onPress={onStartCookMode}
        accessibilityRole="button"
        accessibilityLabel={`Start Cook Mode for ${recipeTitle}`}
        activeOpacity={0.7}
      >
        <Text className="text-xl flex-shrink-0">👨‍🍳</Text>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-brand">
            Cook with step-by-step mode →
          </Text>
          <Text className="text-xs text-text-2 mt-0.5">
            Screen stays on · Timers included · Hands-free
          </Text>
        </View>
      </TouchableOpacity>

      {/* Numbered step list */}
      {steps.map((step) => (
        <StepItem key={step.stepNumber} step={step} />
      ))}
    </View>
  )
}

export default memo(RecipeInstructions)
