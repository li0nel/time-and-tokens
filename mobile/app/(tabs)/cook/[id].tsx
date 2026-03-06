import React from 'react'
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import type { CookStep } from '../../../types/blocks'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CookModeParams extends Record<string, string | string[]> {
  id: string
  steps: string
  recipeTitle: string
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface StepCardProps {
  step: CookStep
  stepIndex: number
  totalSteps: number
}

function StepCard({ step, stepIndex, totalSteps }: StepCardProps) {
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

      {/* Step header: COOK MODE badge + step counter */}
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

          {time != null ? (
            <View className="self-start flex-row items-center gap-1.5 bg-warning-bg rounded-full px-3 py-1">
              <Text className="text-xs text-warning">&#9203;</Text>
              <Text className="text-xs font-semibold text-warning">{time}</Text>
            </View>
          ) : null}

          {warning != null ? (
            <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-1">
              <Text className="text-sm">&#9888;&#65039;</Text>
              <Text className="text-xs text-red-700 flex-1">{warning}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Optional tip strip */}
      {tip != null ? (
        <View className="flex-row items-start gap-2 px-4 py-3 bg-bg-elevated border-t border-border-subtle">
          <Text style={{ fontSize: 14 }} className="flex-shrink-0 mt-0.5">
            &#128161;
          </Text>
          <Text className="text-xs text-text-2 leading-snug flex-1">{tip}</Text>
        </View>
      ) : null}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Quick chip button
// ---------------------------------------------------------------------------

interface ChipProps {
  label: string
  onPress: () => void
  variant?: 'default' | 'primary'
}

function Chip({ label, onPress, variant = 'default' }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full px-3 py-1.5 border ${
        variant === 'primary'
          ? 'bg-brand border-brand'
          : 'bg-bg-surface border-border'
      }`}
      accessibilityRole="button"
    >
      <Text
        className={`text-xs font-semibold ${
          variant === 'primary' ? 'text-white' : 'text-text-2'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function CookModeScreen() {
  const params = useLocalSearchParams<CookModeParams>()

  const recipeTitle = params.recipeTitle ?? 'Recipe'

  // Parse steps from JSON string param
  let steps: CookStep[] = []
  try {
    if (params.steps) {
      const parsed: unknown = JSON.parse(params.steps)
      if (Array.isArray(parsed)) {
        steps = parsed as CookStep[]
      }
    }
  } catch {
    // Malformed steps param — fall through with empty array
  }

  function handleBack() {
    router.back()
  }

  function handleChipPress(_label: string) {
    // For MVP: navigate back to chat
    router.back()
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
      {/* App bar */}
      <View className="px-4 py-3 border-b border-border-subtle flex-row items-center gap-3">
        {/* Back button */}
        <Pressable
          onPress={handleBack}
          className="p-1"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text className="text-xl text-text font-medium">&larr;</Text>
        </Pressable>

        {/* COOK MODE badge */}
        <View className="bg-warning-bg rounded-full px-2.5 py-0.5">
          <Text className="text-xs font-bold tracking-widest text-warning uppercase">
            COOK MODE
          </Text>
        </View>

        {/* Recipe title — truncated */}
        <Text
          className="flex-1 text-sm font-semibold text-text"
          numberOfLines={1}
        >
          {recipeTitle}
        </Text>
      </View>

      {/* Step count summary */}
      {steps.length > 0 && (
        <View className="px-4 py-2 bg-bg-elevated border-b border-border-subtle">
          <Text className="text-xs text-text-3">
            {steps.length} step{steps.length !== 1 ? 's' : ''} total
          </Text>
        </View>
      )}

      {/* All steps stacked vertically */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {steps.length === 0 ? (
          <View className="flex-1 items-center justify-center py-16">
            <Text className="text-4xl mb-3">&#128290;</Text>
            <Text className="text-base font-semibold text-text text-center mb-1">
              No steps found
            </Text>
            <Text className="text-sm text-text-2 text-center">
              Go back and try opening cook mode again.
            </Text>
          </View>
        ) : (
          steps.map((step, index) => (
            <StepCard
              key={step.stepNumber}
              step={step}
              stepIndex={index}
              totalSteps={steps.length}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom input bar with quick chips */}
      <View className="border-t border-border-subtle bg-bg-surface pb-2">
        {/* Chip row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 8,
          }}
        >
          <Chip
            label="Next step ›"
            variant="primary"
            onPress={() => handleChipPress('Next step')}
          />
          <Chip
            label="&#9203; Set timer"
            onPress={() => handleChipPress('Set timer')}
          />
          <Chip label="Help" onPress={() => handleChipPress('Help')} />
          <Chip
            label="&#9208; Pause"
            onPress={() => handleChipPress('Pause')}
          />
        </ScrollView>

        {/* Placeholder input row */}
        <View className="flex-row items-center mx-3 bg-bg-elevated border border-border rounded-xl px-4 py-2.5 gap-2">
          <Text className="flex-1 text-sm text-text-3">
            Ask anything while cooking...
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
