import React, { memo } from 'react'
import { ScrollView, Pressable, Text } from 'react-native'
import type { QuickRepliesBlock } from '../../types/blocks'

interface Props {
  block: QuickRepliesBlock
  onAction: (message: string) => void
  testID?: string
}

/**
 * Horizontal scrollable row of tappable suggestion chips.
 * Each chip injects its text as a plain user chat message when tapped.
 */
function QuickReplies({ block, onAction, testID }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      testID={testID ?? 'quick-replies'}
      className="flex-row"
      contentContainerClassName="px-4 py-2 gap-x-2"
    >
      {block.data.replies.map((reply, index) => (
        <Pressable
          key={`${reply}-${index}`}
          testID={`quick-reply-chip-${index}`}
          onPress={() => onAction(reply)}
          className="border border-border rounded-full px-4 py-2 bg-bg-surface active:opacity-70"
        >
          <Text className="text-sm text-text font-inter">
            {reply}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  )
}

export default memo(QuickReplies)
