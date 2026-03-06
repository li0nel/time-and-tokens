import React, { memo, useCallback, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

/**
 * Chat input bar matching the mockup's input-bar-wrap > input-row structure.
 * The entire input row is a single rounded pill container with:
 *   mic icon | text field | search icon | send button
 */
function ChatInput({ onSend, disabled = false }: Props) {
  const [text, setText] = useState('')
  const inputRef = useRef<TextInput>(null)

  const isEmpty = text.trim().length === 0
  const sendDisabled = disabled || isEmpty

  const buttonScale = useSharedValue(0.85)
  const buttonOpacity = useSharedValue(0.4)

  const updateButtonAnimation = useCallback(
    (hasText: boolean) => {
      buttonScale.value = withTiming(hasText ? 1 : 0.85, { duration: 150 })
      buttonOpacity.value = withTiming(hasText ? 1 : 0.4, { duration: 150 })
    },
    [buttonScale, buttonOpacity]
  )

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value)
      updateButtonAnimation(value.trim().length > 0)
    },
    [updateButtonAnimation]
  )

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || sendDisabled) return
    onSend(trimmed)
    setText('')
    updateButtonAnimation(false)
  }, [text, sendDisabled, onSend, updateButtonAnimation])

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }))

  const inputBar = (
    <View className="border-t border-border-subtle bg-bg py-3 px-4">
      {/* Single rounded container — input-row */}
      <View
        className="flex-row items-center bg-bg-surface border border-border rounded-[20px] px-3.5 py-2.5"
        style={{ gap: 10 }}
      >
        {/* Mic button */}
        <Pressable
          className="w-9 h-9 rounded-full bg-bg-elevated border border-border items-center justify-center flex-shrink-0"
          accessibilityRole="button"
          accessibilityLabel="Voice input"
        >
          <Feather name="mic" size={18} color="#6B6360" />
        </Pressable>

        {/* Text field */}
        <TextInput
          ref={inputRef}
          testID="chat-input"
          className="flex-1 text-base text-text"
          placeholder="Ask about recipes..."
          placeholderTextColor="#A8A09A"
          value={text}
          onChangeText={handleChangeText}
          multiline
          blurOnSubmit={false}
          onSubmitEditing={handleSend}
          editable={!disabled}
          returnKeyType="send"
          style={{ maxHeight: 120, textAlignVertical: 'top' }}
        />

        {/* Search button */}
        <Pressable
          className="w-9 h-9 rounded-full bg-bg-elevated border border-border items-center justify-center flex-shrink-0"
          accessibilityRole="button"
          accessibilityLabel="Search recipes"
        >
          <Feather name="search" size={18} color="#6B6360" />
        </Pressable>

        {/* Send button */}
        <Pressable
          testID="send-button"
          onPress={handleSend}
          disabled={sendDisabled}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          className="flex-shrink-0"
        >
          <Animated.View
            style={animatedButtonStyle}
            className="w-9 h-9 rounded-full bg-user-bubble items-center justify-center"
          >
            <Feather name="send" size={15} color="#F5F2EC" />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {inputBar}
    </KeyboardAvoidingView>
  )
}

export default memo(ChatInput)
