import React, { memo, useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

const DOT_COUNT = 3
const ANIMATION_DURATION = 400
const STAGGER_DELAY = 150

interface DotProps {
  delay: number
}

function Dot({ delay }: DotProps) {
  const opacity = useSharedValue(0.3)
  const scale = useSharedValue(0.8)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: ANIMATION_DURATION }),
          withTiming(0.3, { duration: ANIMATION_DURATION }),
        ),
        -1,
        false,
      ),
    )
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: ANIMATION_DURATION }),
          withTiming(0.8, { duration: ANIMATION_DURATION }),
        ),
        -1,
        false,
      ),
    )
  }, [delay, opacity, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View
      style={animatedStyle}
      className="w-2 h-2 rounded-full bg-text-3 mx-1"
    />
  )
}

interface Props {
  visible?: boolean
}

/**
 * Three animated dots indicating the AI is thinking.
 * Each dot pulses with a staggered opacity/scale animation using Reanimated.
 */
function ThinkingIndicator({ visible = true }: Props) {
  if (!visible) return null

  return (
    <View className="px-4 py-2">
      <View className="flex-row items-center py-3 px-4 bg-bg-elevated rounded-2xl rounded-bl-xs self-start">
        {Array.from({ length: DOT_COUNT }).map((_, index) => (
          <Dot key={index} delay={index * STAGGER_DELAY} />
        ))}
      </View>
    </View>
  )
}

export default memo(ThinkingIndicator)
