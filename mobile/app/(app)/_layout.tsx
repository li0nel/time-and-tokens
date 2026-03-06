import { Redirect } from 'expo-router'
import React from 'react'

/**
 * The (app) route group now delegates to (tabs) which contains the full
 * authenticated tab navigator with its own auth guard.
 */
export default function AppLayout() {
  return <Redirect href="/(tabs)" />
}
