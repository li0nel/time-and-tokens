import React, { useEffect, useState } from 'react'
import { Redirect, Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View, Text } from 'react-native'

import { useAuth } from '../../hooks/useAuth'
import { loadShoppingList } from '../../services/shopping'
import type { ShoppingList } from '../../types/shopping'

// Brand terracotta colour used for the active tab indicator
const BRAND_COLOR = '#C8481C'
const INACTIVE_COLOR = '#A8A09A'
const TAB_BAR_BG = '#FFFFFF'

function ShoppingTabIcon({
  color,
  focused,
}: {
  color: string
  focused: boolean
}) {
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchCount() {
      const list: ShoppingList = await loadShoppingList()
      if (!cancelled) {
        setItemCount(list.length)
      }
    }

    void fetchCount()

    return () => {
      cancelled = true
    }
  }, [focused]) // Re-fetch when the tab becomes focused

  return (
    <View className="relative">
      <Ionicons name="cart-outline" size={24} color={color} />
      {itemCount > 0 && (
        <View className="absolute -top-1 -right-1 bg-brand rounded-full min-w-[16px] h-4 items-center justify-center px-0.5">
          <Text className="text-text-inv text-2xs font-semibold leading-tight">
            {itemCount > 99 ? '99+' : String(itemCount)}
          </Text>
        </View>
      )}
    </View>
  )
}

export default function TabsLayout() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Redirect href="/(auth)/sign-in" />

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: TAB_BAR_BG,
          borderTopColor: '#F0EBE2',
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Shopping',
          tabBarIcon: ({ color, focused }) => (
            <ShoppingTabIcon color={color} focused={focused} />
          ),
        }}
      />
      {/* Cook mode — full-screen, no tab bar */}
      <Tabs.Screen
        name="cook/[id]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  )
}
