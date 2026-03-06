import React from 'react'
import { render, screen } from '@testing-library/react-native'
import ChatFeed from '../../components/chat/ChatFeed'
import type { ChatMessage } from '../../types/blocks'

const USER_MESSAGE: ChatMessage = {
  id: 'msg-user-1',
  role: 'user',
  content: 'I want to make pasta tonight',
  timestamp: new Date('2026-03-06T10:00:00Z'),
}

const ASSISTANT_MESSAGE: ChatMessage = {
  id: 'msg-ai-1',
  role: 'assistant',
  content: 'Great choice! Here is a recipe for you.',
  blocks: [
    {
      type: 'text',
      data: { content: 'Great choice! Here is a recipe for you.' },
    },
  ],
  timestamp: new Date('2026-03-06T10:00:05Z'),
}

const ASSISTANT_NO_BLOCKS: ChatMessage = {
  id: 'msg-ai-2',
  role: 'assistant',
  content: 'Pasta is always a good idea.',
  timestamp: new Date('2026-03-06T10:00:10Z'),
}

describe('ChatFeed', () => {
  it('renders without crashing when messages list is empty', () => {
    render(<ChatFeed messages={[]} onAction={jest.fn()} />)
    // Should render without throwing
  })

  it('renders a user message', () => {
    render(<ChatFeed messages={[USER_MESSAGE]} onAction={jest.fn()} />)

    expect(screen.getByText('I want to make pasta tonight')).toBeTruthy()
  })

  it('renders an assistant message with blocks via TextBlock', () => {
    render(<ChatFeed messages={[ASSISTANT_MESSAGE]} onAction={jest.fn()} />)

    expect(
      screen.getByText('Great choice! Here is a recipe for you.'),
    ).toBeTruthy()
  })

  it('renders an assistant message without blocks as plain text', () => {
    render(<ChatFeed messages={[ASSISTANT_NO_BLOCKS]} onAction={jest.fn()} />)

    expect(screen.getByText('Pasta is always a good idea.')).toBeTruthy()
  })

  it('renders multiple messages in order', () => {
    const messages = [USER_MESSAGE, ASSISTANT_MESSAGE]
    render(<ChatFeed messages={messages} onAction={jest.fn()} />)

    expect(screen.getByText('I want to make pasta tonight')).toBeTruthy()
    expect(
      screen.getByText('Great choice! Here is a recipe for you.'),
    ).toBeTruthy()
  })
})
