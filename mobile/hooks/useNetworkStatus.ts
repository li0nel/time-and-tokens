import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

interface NetworkStatus {
  isOnline: boolean
}

/**
 * Tracks the device's network connectivity state.
 *
 * - Web: uses `navigator.onLine` with `online`/`offline` window event listeners.
 * - Native (iOS/Android): defaults to true (online) — a future upgrade can
 *   swap this for `@react-native-community/netinfo` or `expo-network` once
 *   installed. For now the banner only shows on web where we have a reliable
 *   signal.
 *
 * Returns `{ isOnline: boolean }`.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (Platform.OS === 'web') {
      // navigator.onLine is available in browsers; default to true if undefined.
      return typeof navigator !== 'undefined' ? navigator.onLine : true
    }
    // On native, assume online until a network library is integrated.
    return true
  })

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Native: no-op for now; hook is ready to be wired to
      // @react-native-community/netinfo when installed.
      return
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}
