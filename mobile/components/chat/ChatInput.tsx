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

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

/**
 * Chat input bar with a multiline TextInput and an animated send button.
 * Uses KeyboardStickyView from react-native-keyboard-controller when available,
 * otherwise falls back to KeyboardAvoidingView.
 */
function ChatInput({ onSend, disabled = false }: Props) {
  const [text, setText] = useState('')
  const inputRef = useRef<TextInput>(null)

  const isEmpty = text.trim().length === 0
  const sendDisabled = disabled || isEmpty

  // Animate send button scale and opacity based on whether text is empty
  const buttonScale = useSharedValue(0.85)
  const buttonOpacity = useSharedValue(0.4)

  const updateButtonAnimation = useCallback(
    (hasText: boolean) => {
      buttonScale.value = withTiming(hasText ? 1 : 0.85, { duration: 150 })
      buttonOpacity.value = withTiming(hasText ? 1 : 0.4, { duration: 150 })
    },
    [buttonScale, buttonOpacity],
  )

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value)
      updateButtonAnimation(value.trim().length > 0)
    },
    [updateButtonAnimation],
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
    <View className="border-t border-border bg-bg-surface px-4 py-3 flex-row items-end gap-x-3">
      <TextInput
        ref={inputRef}
        testID="chat-input"
        className="flex-1 text-base text-text leading-normal bg-bg-elevated rounded-xl px-4 py-3 min-h-[44px] max-h-[120px] font-inter"
        placeholder="Ask about recipes..."
        placeholderTextColor="#A8A09A"
        value={text}
        onChangeText={handleChangeText}
        multiline
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
        editable={!disabled}
        returnKeyType="send"
        style={{ textAlignVertical: 'center' }}
      />
      <Pressable
        testID="send-button"
        onPress={handleSend}
        disabled={sendDisabled}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        <Animated.View
          style={animatedButtonStyle}
          className="w-11 h-11 rounded-full bg-user-bubble items-center justify-center"
        >
          {/* Send arrow icon */}
          <View className="items-center justify-center">
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 6,
                borderRightWidth: 6,
                borderBottomWidth: 10,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: '#F5F2EC',
                marginBottom: 1,
              }}
            />
          </View>
        </Animated.View>
      </Pressable>
    </View>
  )

  // Use KeyboardAvoidingView as fallback (KeyboardStickyView requires special setup)
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
