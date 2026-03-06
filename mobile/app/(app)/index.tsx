import React from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ChatFeed from '../../components/chat/ChatFeed'
import ChatInput from '../../components/chat/ChatInput'
import ThinkingIndicator from '../../components/chat/ThinkingIndicator'
import { useChat } from '../../hooks/useChat'

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-16">
      <Text className="text-5xl mb-4">🍜</Text>
      <Text className="text-xl font-semibold text-text text-center mb-2">
        Ready to cook?
      </Text>
      <Text className="text-sm text-text-2 text-center leading-relaxed">
        Ask me anything about recipes, ingredients, or techniques. I'm your AI cooking companion.
      </Text>
      <Text className="text-sm text-text-3 text-center mt-2">
        I'm here to make you a better chef over time.
      </Text>
    </View>
  )
}

export default function ChatScreen() {
  const { messages, isThinking, sendMessage, handleAction } = useChat()

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
      {/* App bar */}
      <View className="px-4 py-3 border-b border-border-subtle flex-row items-center justify-between">
        <Text className="text-2xl font-black tracking-tighter text-text">
          mise<Text className="text-brand">.</Text>
        </Text>
      </View>

      <View className="flex-1">
        {messages.length === 0 && !isThinking ? (
          <EmptyState />
        ) : (
          <ChatFeed messages={messages} onAction={handleAction} />
        )}
        <ThinkingIndicator visible={isThinking} />
        <ChatInput onSend={sendMessage} disabled={isThinking} />
      </View>
    </SafeAreaView>
  )
}
