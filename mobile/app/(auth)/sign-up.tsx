import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Link, router } from 'expo-router'

import { signUpWithEmail } from '../../services/auth'

export default function SignUpScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await signUpWithEmail(email, password)
      // Root layout will redirect to the app area once auth state updates.
      router.replace('/(app)')
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Account creation failed. Please try again.'
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

      {/* Name */}
      <View className="mb-3">
        <Text className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-1.5">
          Name
        </Text>
        <TextInput
          testID="name-input"
          className="h-12 bg-bg-surface border border-border rounded-md px-4 text-base text-text"
          placeholder="Your name"
          placeholderTextColor="#C4BCB5"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
      </View>

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
          placeholder="At least 6 characters"
          placeholderTextColor="#C4BCB5"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </View>

      {/* Create Account button */}
      <TouchableOpacity
        testID="sign-up-button"
        className="h-[50px] bg-brand rounded-md items-center justify-center mb-1 active:scale-[0.985]"
        onPress={handleSignUp}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Create account"
      >
        <Text className="text-base font-bold text-text-inv tracking-tight">
          {loading ? 'Creating account…' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      {/* Sign-in footer */}
      <View className="mt-8 items-center">
        <Text className="text-sm text-text-3">
          {'Already have an account? '}
          <Link href="/(auth)/sign-in" asChild>
            <Text className="text-brand font-semibold">Sign in</Text>
          </Link>
        </Text>
      </View>
    </ScrollView>
  )
}
