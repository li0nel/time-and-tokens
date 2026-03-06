import { Redirect, Stack } from 'expo-router'
import React from 'react'

import { useAuth } from '../../hooks/useAuth'

export default function AppLayout() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Redirect href="/(auth)/sign-in" />

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}
