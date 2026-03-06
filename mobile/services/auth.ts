import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth'
import { Platform } from 'react-native'
import { getFirebaseAuth } from './firebase'

/**
 * Sign in an existing user with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
  return credential.user
}

/**
 * Create a new user account with email and password.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  )
  return credential.user
}

/**
 * Sign in with Google.
 * - On web: uses signInWithPopup.
 * - On native: throws a "not implemented" error — native Google sign-in
 *   requires expo-auth-session or @react-native-google-signin/google-signin.
 */
export async function signInWithGoogle(): Promise<User> {
  if (Platform.OS === 'web') {
    const provider = new GoogleAuthProvider()
    const credential = await signInWithPopup(getFirebaseAuth(), provider)
    return credential.user
  }

  throw new Error(
    'Google sign-in is not yet implemented on native. ' +
      'Use email/password authentication instead.',
  )
}

/**
 * Sign out the currently authenticated user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth())
}
