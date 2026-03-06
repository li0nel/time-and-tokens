import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ChatFeed from '../../components/chat/ChatFeed'
import ChatInput from '../../components/chat/ChatInput'
import ThinkingIndicator from '../../components/chat/ThinkingIndicator'
import { useChat } from '../../hooks/useChat'

/**
 * Main chat screen — composes ChatFeed, ThinkingIndicator, and ChatInput
 * using the useChat hook for state management.
 *
 * Hardcoded mock messages are used initially to test rendering without Gemini.
 */
export default function ChatScreen() {
  const { messages, isThinking, sendMessage, handleAction } = useChat()

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
      <View className="flex-1">
        <ChatFeed messages={messages} onAction={handleAction} />
        <ThinkingIndicator visible={isThinking} />
        <ChatInput onSend={sendMessage} disabled={isThinking} />
      </View>
    </SafeAreaView>
  )
}
