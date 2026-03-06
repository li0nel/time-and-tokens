import React, { memo } from 'react'
import { View, Text } from 'react-native'
import type { ChatMessage, QuickRepliesBlock } from '../../types/blocks'
import WidgetRenderer from '../widgets/WidgetRenderer'
import QuickReplies from './QuickReplies'

interface Props {
  message: ChatMessage
  onAction: (message: string) => void
  testID?: string
}

/**
 * Renders an assistant message by mapping its blocks through WidgetRenderer.
 * Quick-replies blocks are rendered as a horizontal chip row via QuickReplies.
 * Falls back to plain text if no blocks are present.
 */
function AIMessage({ message, onAction, testID }: Props) {
  if (message.blocks && message.blocks.length > 0) {
    return (
      <View testID={testID ?? 'assistant-message'} className="px-4 py-1 gap-y-2">
        {message.blocks.map((block, index) => {
          if (block.type === 'quick_replies') {
            return (
              <QuickReplies
                key={`${message.id}-block-${index}`}
                block={block as QuickRepliesBlock}
                onAction={onAction}
                testID={`quick-replies-${index}`}
              />
            )
          }
          return (
            <WidgetRenderer
              key={`${message.id}-block-${index}`}
              block={block}
              onAction={onAction}
            />
          )
        })}
      </View>
    )
  }

  // Fallback: render raw content as plain text
  return (
    <View testID={testID ?? 'assistant-message'} className="px-4 py-1">
      <Text className="text-text text-base leading-normal font-inter">
        {message.content}
      </Text>
    </View>
  )
}

export default memo(AIMessage)
