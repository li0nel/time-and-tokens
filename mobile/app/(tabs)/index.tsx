import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import ChatFeed from '../../components/chat/ChatFeed'
import ChatInput from '../../components/chat/ChatInput'
import ThinkingIndicator from '../../components/chat/ThinkingIndicator'
import ToolCallStatusIndicator from '../../components/chat/ToolCallStatusIndicator'
import { useChat } from '../../hooks/useChat'
import { loadShoppingList } from '../../services/shopping'
import type { ShoppingList } from '../../types/shopping'

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-16">
      <Text className="text-5xl mb-4">🍜</Text>
      <Text className="text-xl font-semibold text-text text-center mb-2">
        Ready to cook?
      </Text>
      <Text className="text-sm text-text-2 text-center leading-relaxed">
        Ask me anything about recipes, ingredients, or techniques. Your AI
        cooking companion.
      </Text>
      <Text className="text-sm text-text-3 text-center mt-2">
        Here to make you a better chef over time.
      </Text>
    </View>
  )
}

export default function ChatScreen() {
  const { messages, isThinking, toolCallStatus, sendMessage, handleAction } =
    useChat()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchCartCount() {
      const list: ShoppingList = await loadShoppingList()
      if (!cancelled) {
        setCartCount(list.length)
      }
    }

    void fetchCartCount()

    return () => {
      cancelled = true
    }
  }, [])

  function handleCartPress() {
    router.push('/(tabs)/shopping')
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
      {/* App bar */}
      <View className="px-4 py-3 border-b border-border-subtle flex-row items-center justify-between">
        <Text className="text-2xl font-black tracking-tighter text-text">
          mise<Text className="text-brand">.</Text>
        </Text>
        <Pressable onPress={handleCartPress} className="p-1">
          <View className="relative">
            <Ionicons name="cart-outline" size={24} color="#1C1917" />
            {cartCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-brand rounded-full min-w-[16px] h-4 items-center justify-center px-0.5">
                <Text className="text-text-inv text-2xs font-semibold leading-tight">
                  {cartCount > 99 ? '99+' : String(cartCount)}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>

      <View className="flex-1">
        {messages.length === 0 && !isThinking ? (
          <EmptyState />
        ) : (
          <ChatFeed messages={messages} onAction={handleAction} />
        )}
        <ThinkingIndicator visible={isThinking} />
        {isThinking && toolCallStatus !== null && (
          <ToolCallStatusIndicator status={toolCallStatus} />
        )}
        <ChatInput onSend={sendMessage} disabled={isThinking} />
      </View>
    </SafeAreaView>
  )
}
