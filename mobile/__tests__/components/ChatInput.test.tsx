import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import ChatInput from '../../components/chat/ChatInput'

describe('ChatInput', () => {
  it('renders the text input and send button', () => {
    render(<ChatInput onSend={jest.fn()} />)

    expect(screen.getByTestId('chat-input')).toBeTruthy()
    expect(screen.getByTestId('send-button')).toBeTruthy()
  })

  it('send button is accessible when text is present', () => {
    const onSend = jest.fn()
    render(<ChatInput onSend={onSend} />)

    const input = screen.getByTestId('chat-input')
    fireEvent.changeText(input, 'Hello, chef!')

    const sendButton = screen.getByTestId('send-button')
    expect(sendButton).toBeTruthy()
  })

  it('calls onSend with trimmed text when send button is pressed', () => {
    const onSend = jest.fn()
    render(<ChatInput onSend={onSend} />)

    const input = screen.getByTestId('chat-input')
    fireEvent.changeText(input, '  Make me pasta  ')

    const sendButton = screen.getByTestId('send-button')
    fireEvent.press(sendButton)

    expect(onSend).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith('Make me pasta')
  })

  it('does not call onSend when text is empty', () => {
    const onSend = jest.fn()
    render(<ChatInput onSend={onSend} />)

    const sendButton = screen.getByTestId('send-button')
    fireEvent.press(sendButton)

    expect(onSend).not.toHaveBeenCalled()
  })

  it('clears the input after sending', () => {
    const onSend = jest.fn()
    render(<ChatInput onSend={onSend} />)

    const input = screen.getByTestId('chat-input')
    fireEvent.changeText(input, 'Some recipe request')
    fireEvent.press(screen.getByTestId('send-button'))

    expect(input.props.value).toBe('')
  })

  it('does not call onSend when disabled', () => {
    const onSend = jest.fn()
    render(<ChatInput onSend={onSend} disabled />)

    const input = screen.getByTestId('chat-input')
    fireEvent.changeText(input, 'Test message')
    fireEvent.press(screen.getByTestId('send-button'))

    expect(onSend).not.toHaveBeenCalled()
  })
})
