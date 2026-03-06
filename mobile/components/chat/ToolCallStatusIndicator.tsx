import React, { memo } from 'react'
import { Text, View } from 'react-native'

interface Props {
  status: string
}

/**
 * Small inline indicator shown below ThinkingIndicator when the AI is
 * executing a function call (e.g. looking up recipe details).
 *
 * Design reference: view-03 — clock icon + status text, subtle secondary style.
 */
function ToolCallStatusIndicator({ status }: Props) {
  return (
    <View className="px-4 pb-1">
      <View className="flex-row items-center gap-x-1.5 self-start">
        {/* Clock icon — inline SVG equivalent via Text unicode */}
        <Text className="text-xs text-text-3">⏱</Text>
        <Text className="text-xs text-text-3">{status}</Text>
      </View>
    </View>
  )
}

export default memo(ToolCallStatusIndicator)
