import React, { memo, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import type { CookStep, CookStepsBlock } from '../../types/blocks'

interface Props {
  block: CookStepsBlock
  onAction: (message: string) => void
  testID?: string
}

interface StepViewProps {
  step: CookStep
  stepIndex: number
  totalSteps: number
}

/**
 * Renders the content of a single cook step: instruction, optional timer pill,
 * optional warning, and optional tip strip.
 */
function StepView({ step, stepIndex, totalSteps }: StepViewProps) {
  const { stepNumber, instruction, time, tip, warning } = step
  const progressFraction = (stepIndex + 1) / totalSteps

  return (
    <View className="rounded-xl overflow-hidden bg-bg-surface border border-border shadow-sm">
      {/* Progress bar */}
      <View className="h-1 bg-border-subtle">
        <View
          className="h-1 bg-brand"
          style={{ width: `${progressFraction * 100}%` }}
        />
      </View>

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

        {/* Instruction + optional timer + optional warning */}
        <View className="flex-1 gap-2">
          <Text className="text-base text-text leading-snug">
            {instruction}
          </Text>

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
 * CookSteps widget — paginated single-step view matching view-06.
 *
 * Shows one step at a time with a progress bar, step counter header,
 * and Previous / Next navigation buttons. State is local to this component.
 */
function CookSteps({ block, testID }: Props) {
  const { recipeTitle, steps } = block.data
  const [currentStep, setCurrentStep] = useState(0)

  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1
  const step = steps[currentStep]

  if (!step) return null

  return (
    <View testID={testID ?? 'cook-steps'} className="gap-3">
      {/* Widget title */}
      <View className="px-1">
        <Text className="text-xs font-bold tracking-widest text-brand uppercase">
          COOK MODE
        </Text>
        <Text className="text-base font-semibold text-text mt-0.5">
          {recipeTitle}
        </Text>
      </View>

      {/* Single step card */}
      <StepView step={step} stepIndex={currentStep} totalSteps={steps.length} />

      {/* Navigation buttons */}
      <View className="flex-row gap-3">
        {/* Previous button */}
        <TouchableOpacity
          className={`flex-1 items-center py-3 rounded-xl border ${
            isFirst
              ? 'border-border-subtle bg-bg-elevated opacity-40'
              : 'border-border bg-bg-surface'
          }`}
          onPress={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={isFirst}
          accessibilityLabel="Previous step"
          accessibilityRole="button"
        >
          <Text
            className={`text-sm font-semibold ${isFirst ? 'text-text-3' : 'text-text'}`}
          >
            {'< Previous'}
          </Text>
        </TouchableOpacity>

        {/* Next / Finish button */}
        <TouchableOpacity
          className={`flex-1 items-center py-3 rounded-xl ${
            isLast ? 'bg-brand' : 'bg-brand'
          }`}
          onPress={() =>
            setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
          }
          disabled={isLast}
          accessibilityLabel={isLast ? 'Finish cooking' : 'Next step'}
          accessibilityRole="button"
        >
          <Text className="text-sm font-semibold text-white">
            {isLast ? 'Done \u2713' : 'Next >'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default memo(CookSteps)
