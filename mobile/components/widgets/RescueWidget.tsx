import React, { memo } from 'react'
import { Text, View } from 'react-native'
import type { RescueBlock, RescueStep } from '../../types/blocks'

interface Props {
  block: RescueBlock
  onAction: (message: string) => void
  testID?: string
}

interface RescueStepRowProps {
  step: RescueStep
}

/** A single numbered recovery step row. */
function RescueStepRow({ step }: RescueStepRowProps) {
  const { stepNumber, instruction } = step

  return (
    <View className="flex-row gap-3 mb-2.5">
      {/* Numbered circle */}
      <View className="w-6 h-6 rounded-full bg-warning items-center justify-center flex-shrink-0 mt-0.5">
        <Text className="text-xs font-bold text-white">{stepNumber}</Text>
      </View>

      {/* Instruction text */}
      <Text className="text-sm text-text leading-normal flex-1">
        {instruction}
      </Text>
    </View>
  )
}

/**
 * RescueWidget — cook error recovery guidance block.
 * Matches view-11 mock: warm amber styling, numbered steps, optional tip.
 */
function RescueWidget({ block, testID }: Props) {
  const { header, steps, tip } = block.data

  return (
    <View
      testID={testID ?? 'rescue-widget'}
      className="bg-warning-bg border border-warning rounded-xl overflow-hidden p-4"
    >
      {/* Header: icon + reassurance text */}
      <View className="flex-row items-center gap-2 mb-3">
        <Text style={{ fontSize: 20 }}>⚠️</Text>
        <Text className="text-base font-bold text-warning flex-1">
          {header}
        </Text>
      </View>

      {/* Recovery steps */}
      {steps.map((step) => (
        <RescueStepRow key={step.stepNumber} step={step} />
      ))}

      {/* Optional encouraging tip */}
      {tip ? (
        <View className="mt-2 pt-2 border-t border-warning">
          <Text className="text-xs text-warning italic leading-snug">
            {tip}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

export default memo(RescueWidget)
