import React, { memo } from 'react'
import { Text, View } from 'react-native'
import type { CookStep, CookStepsBlock } from '../../types/blocks'

interface Props {
  block: CookStepsBlock
  onAction: (message: string) => void
  testID?: string
}

interface StepCardProps {
  step: CookStep
  totalSteps: number
  testID?: string
}

/**
 * A single cook step card — numbered circle, instruction text,
 * optional timer badge, tip, and warning.
 */
function StepCard({ step, totalSteps, testID }: StepCardProps) {
  const { stepNumber, instruction, time, tip, warning } = step

  return (
    <View
      testID={testID}
      className="rounded-xl overflow-hidden bg-bg-surface border border-border shadow-sm"
    >
      {/* Step header: COOK MODE label + step counter */}
      <View className="flex-row items-center justify-between px-4 py-2 bg-bg-elevated border-b border-border-subtle">
        <Text className="text-xs font-bold tracking-widest text-brand uppercase">
          COOK MODE
        </Text>
        <Text className="text-xs text-text-3">
          Step {stepNumber} of {totalSteps}
        </Text>
      </View>

      {/* Body: numbered circle + instruction */}
      <View className="flex-row gap-3 p-4">
        {/* Numbered circle */}
        <View className="w-8 h-8 rounded-full bg-brand items-center justify-center flex-shrink-0">
          <Text className="text-sm font-bold text-white">{stepNumber}</Text>
        </View>

        {/* Instruction + optional timer */}
        <View className="flex-1 gap-2">
          <Text className="text-base text-text leading-snug">{instruction}</Text>

          {time ? (
            <View className="self-start flex-row items-center gap-1.5 bg-warning-bg rounded-full px-3 py-1">
              <Text className="text-xs text-warning">⏱</Text>
              <Text className="text-xs font-semibold text-warning">{time}</Text>
            </View>
          ) : null}

          {warning ? (
            <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-1">
              <Text className="text-sm">⚠️</Text>
              <Text className="text-xs text-red-700 flex-1">{warning}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Optional tip strip */}
      {tip ? (
        <View className="flex-row items-start gap-2 px-4 py-3 bg-bg-elevated border-t border-border-subtle">
          <Text style={{ fontSize: 14 }} className="flex-shrink-0 mt-0.5">
            💡
          </Text>
          <Text className="text-xs text-text-2 leading-snug flex-1">{tip}</Text>
        </View>
      ) : null}
    </View>
  )
}

/**
 * CookSteps widget — matches view-10 mock.
 * Renders all steps stacked vertically in COOK MODE style.
 * Each step has a numbered circle, optional timer badge, tip, and warning.
 */
function CookSteps({ block, testID }: Props) {
  const { recipeTitle, steps } = block.data

  return (
    <View testID={testID ?? 'cook-steps'} className="gap-3">
      {/* Widget title */}
      <View className="px-1">
        <Text className="text-xs font-bold tracking-widest text-brand uppercase">
          COOK MODE
        </Text>
        <Text className="text-base font-semibold text-text mt-0.5">{recipeTitle}</Text>
      </View>

      {/* All steps stacked */}
      {steps.map((step) => (
        <StepCard
          key={step.stepNumber}
          step={step}
          totalSteps={steps.length}
          testID={`cook-step-${step.stepNumber}`}
        />
      ))}
    </View>
  )
}

export default memo(CookSteps)
