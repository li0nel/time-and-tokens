/**
 * Type augmentation for firebase/auth to expose getReactNativePersistence.
 *
 * Firebase 12 ships getReactNativePersistence in its React Native bundle
 * (the "react-native" exports condition), but TypeScript's condition resolution
 * picks the root "types" key before the "react-native" key, so the export is
 * missing from the generated types. This declaration restores it.
 */
import type { Persistence } from 'firebase/auth'

interface ReactNativeAsyncStorage {
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<string | null>
  removeItem(key: string): Promise<void>
}

declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence
}

declare module '@firebase/auth' {
  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage,
  ): Persistence
}
