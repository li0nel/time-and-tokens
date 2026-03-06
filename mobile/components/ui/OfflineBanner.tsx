import { useEffect, useRef } from 'react'
import { Animated, Text, View } from 'react-native'

import { useNetworkStatus } from '../../hooks/useNetworkStatus'

/**
 * Displays a fixed bottom banner when the device has no internet connection.
 *
 * Design reference: view-52-offline-chat (amber warning strip).
 *
 * - Only renders content when `isOnline` is false.
 * - Fades in when the offline state is detected.
 * - Positioned absolutely at the bottom so it overlays all screens without
 *   affecting layout flow.
 */
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus()
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isOnline ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start()
  }, [isOnline, opacity])

  // When online, the banner is invisible (opacity 0) and pointer-events none;
  // this avoids layout shifts while keeping the animation smooth.
  if (isOnline) {
    return null
  }

  return (
    <Animated.View
      style={{ opacity }}
      className="absolute bottom-0 left-0 right-0 z-50"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      {/* Amber warning banner matching the mockup design token: warning.bg */}
      <View className="flex-row items-center gap-2 px-4 py-2 bg-warning-bg border-t border-amber-400">
        {/* Wifi-off icon rendered as Unicode / text fallback */}
        <Text className="text-warning text-base" accessibilityElementsHidden>
          📶
        </Text>
        <View className="flex-1">
          <Text className="text-warning font-semibold text-sm">
            No internet connection
          </Text>
          <Text className="text-warning text-xs opacity-80">
            Some features unavailable
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}
