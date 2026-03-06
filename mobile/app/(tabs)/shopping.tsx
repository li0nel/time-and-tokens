import React from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ShoppingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
      {/* App bar */}
      <View className="px-4 py-3 border-b border-border-subtle">
        <Text className="text-2xl font-black tracking-tighter text-text">
          mise<Text className="text-brand">.</Text>
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl mb-4">🛒</Text>
        <Text className="text-xl font-semibold text-text text-center mb-2">
          Shopping List
        </Text>
        <Text className="text-sm text-text-2 text-center leading-relaxed">
          Shopping list coming soon. Your ingredients will appear here.
        </Text>
      </View>
    </SafeAreaView>
  )
}
