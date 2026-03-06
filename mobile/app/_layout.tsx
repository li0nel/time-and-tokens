import '../global.css'

import * as SplashScreen from 'expo-splash-screen'
import { Slot } from 'expo-router'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { KeyboardProvider } from 'react-native-keyboard-controller'

import { useAuth } from '../hooks/useAuth'

export { ErrorBoundary } from 'expo-router'

// Prevent splash screen from auto-hiding before auth state is resolved.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync()
    }
  }, [loading])

  // Show nothing while Firebase resolves the initial auth state.
  if (loading) {
    return null
  }

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <Slot />
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}
