import { Redirect } from 'expo-router'
import React from 'react'

/**
 * The main app entry point now lives in (tabs)/index.tsx.
 * Redirect here to ensure any direct navigation to / goes through the tabs.
 */
export default function AppIndex() {
  return <Redirect href="/(tabs)" />
}
