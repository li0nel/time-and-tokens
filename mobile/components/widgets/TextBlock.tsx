import React, { memo } from 'react'
import { Text, View } from 'react-native'
import type { TextBlock as TextBlockType } from '../../types/blocks'

interface Props {
  block: TextBlockType
  onAction: (message: string) => void
  testID?: string
}

/**
 * Renders a plain prose block from the assistant.
 * Supports basic markdown: **bold**, _italic_, and newlines → line breaks.
 */
function TextBlock({ block, testID }: Props) {
  const segments = parseMarkdown(block.data.content)

  return (
    <View testID={testID ?? 'text-block'} className="px-1 py-0.5">
      <Text className="text-base text-text leading-normal">
        {segments.map((seg, i) => {
          if (seg.type === 'bold') {
            return (
              <Text key={i} className="font-bold">
                {seg.text}
              </Text>
            )
          }
          if (seg.type === 'italic') {
            return (
              <Text key={i} className="italic">
                {seg.text}
              </Text>
            )
          }
          // plain text — render newlines as line breaks
          return seg.text
            .split('\n')
            .flatMap((line, lineIdx, arr) => {
              const nodes: React.ReactNode[] = [
                <Text key={`${i}-${lineIdx}-t`}>{line}</Text>,
              ]
              if (lineIdx < arr.length - 1) {
                nodes.push(<Text key={`${i}-${lineIdx}-nl`}>{'\n'}</Text>)
              }
              return nodes
            })
        })}
      </Text>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Minimal markdown parser — bold, italic, plain
// ---------------------------------------------------------------------------

type Segment =
  | { type: 'plain'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'italic'; text: string }

function parseMarkdown(raw: string): Segment[] {
  const segments: Segment[] = []
  // Match **bold**, _italic_, or plain runs
  const re = /\*\*(.+?)\*\*|_(.+?)_/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'plain', text: raw.slice(lastIndex, match.index) })
    }
    if (match[1] !== undefined) {
      segments.push({ type: 'bold', text: match[1] })
    } else if (match[2] !== undefined) {
      segments.push({ type: 'italic', text: match[2] })
    }
    lastIndex = re.lastIndex
  }

  if (lastIndex < raw.length) {
    segments.push({ type: 'plain', text: raw.slice(lastIndex) })
  }

  return segments
}

export default memo(TextBlock)
