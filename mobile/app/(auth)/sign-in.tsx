import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Link, router } from 'expo-router'

import { signInWithEmail, signInWithGoogle } from '../../services/auth'

export default function SignInScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await signInWithEmail(email, password)
      // Root layout will redirect to the app area once auth state updates.
      router.replace('/(app)')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Sign in failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      router.replace('/(app)')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Google sign-in failed.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="px-7 pt-8 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      {/* Brand */}
      <View className="items-center mb-9 mt-2">
        <Text className="text-5xl font-inter font-black tracking-tighter text-text">
          mise<Text className="text-brand">.</Text>
        </Text>
        <Text className="text-sm text-text-3 mt-1.5 tracking-wide">
          Your AI cooking companion
        </Text>
      </View>

      {/* Error */}
      {error !== null && (
        <View className="bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-4">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      )}

      {/* Email */}
      <View className="mb-3">
        <Text className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-1.5">
          Email
        </Text>
        <TextInput
          testID="email-input"
          className="h-12 bg-bg-surface border border-border rounded-md px-4 text-base text-text"
          placeholder="you@example.com"
          placeholderTextColor="#C4BCB5"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />
      </View>

      {/* Password */}
      <View className="mb-5">
        <Text className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-1.5">
          Password
        </Text>
        <TextInput
          testID="password-input"
          className="h-12 bg-bg-surface border border-border rounded-md px-4 text-base text-text"
          placeholder="••••••••"
          placeholderTextColor="#C4BCB5"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
        />
      </View>

      {/* Sign In button */}
      <TouchableOpacity
        testID="sign-in-button"
        className="h-[50px] bg-brand rounded-md items-center justify-center mb-1 active:scale-[0.985]"
        onPress={handleSignIn}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
      >
        <Text className="text-base font-bold text-text-inv tracking-tight">
          {loading ? 'Signing in…' : 'Sign in'}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center my-5">
        <View className="flex-1 h-px bg-border-subtle" />
        <Text className="mx-3 text-xs font-medium text-text-3 tracking-widest">
          or
        </Text>
        <View className="flex-1 h-px bg-border-subtle" />
      </View>

      {/* Google Sign In */}
      <TouchableOpacity
        testID="google-sign-in-button"
        className="h-12 bg-bg-surface border border-border rounded-md flex-row items-center justify-center gap-2.5 mb-2.5 active:bg-bg-elevated"
        onPress={handleGoogleSignIn}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        {/* Google G icon */}
        <Text className="text-base font-semibold text-text tracking-tight">
          Continue with Google
        </Text>
      </TouchableOpacity>

      {/* Sign-up footer */}
      <View className="mt-8 items-center">
        <Text className="text-sm text-text-3">
          {'Don\'t have an account? '}
          <Link href="/(auth)/sign-up" asChild>
            <Text className="text-brand font-semibold">Sign up</Text>
          </Link>
        </Text>
      </View>
    </ScrollView>
  )
}
