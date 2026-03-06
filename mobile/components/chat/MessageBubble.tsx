import React, { memo } from 'react'
import { View, Text } from 'react-native'
import type { ChatMessage } from '../../types/blocks'

interface Props {
  message: ChatMessage
}

/**
 * Dark rounded bubble for user messages.
 * Uses user-bubble (#1C1917) background and user-text (#F5F2EC) text.
 */
function MessageBubble({ message }: Props) {
  return (
    <View className="items-end px-4 py-1">
      <View className="bg-user-bubble rounded-2xl rounded-br-xs px-4 py-3 max-w-[85%]">
        <Text className="text-user-text text-base leading-normal font-inter">
          {message.content}
        </Text>
      </View>
    </View>
  )
}

export default memo(MessageBubble)
