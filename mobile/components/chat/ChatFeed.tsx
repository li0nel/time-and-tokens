import { FlashList } from '@shopify/flash-list'
import React, { memo, useCallback } from 'react'
import { View } from 'react-native'
import type { ChatMessage } from '../../types/blocks'
import AIMessage from './AIMessage'
import MessageBubble from './MessageBubble'

interface Props {
  messages: ChatMessage[]
  onAction: (message: string) => void
}

/**
 * Renders the scrollable chat history using FlashList.
 * - Uses startRenderingFromBottom to anchor content at the bottom.
 * - Uses maintainVisibleContentPosition to prevent scroll jumps when new
 *   messages are prepended above the visible area.
 * - Does NOT use inverted — items render top-to-bottom in natural order.
 */
function ChatFeed({ messages, onAction }: Props) {
  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      if (item.role === 'user') {
        return <MessageBubble message={item} />
      }
      return <AIMessage message={item} onAction={onAction} />
    },
    [onAction],
  )

  const keyExtractor = useCallback((item: ChatMessage) => item.id, [])

  return (
    <View className="flex-1">
      <FlashList
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        maintainVisibleContentPosition={{
          startRenderingFromBottom: true,
          autoscrollToBottomThreshold: 100,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
  )
}

export default memo(ChatFeed)
