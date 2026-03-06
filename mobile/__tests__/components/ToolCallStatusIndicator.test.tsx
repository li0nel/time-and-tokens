import React from 'react'
import { render, screen } from '@testing-library/react-native'
import ToolCallStatusIndicator from '../../components/chat/ToolCallStatusIndicator'

describe('ToolCallStatusIndicator', () => {
  it('renders the status text', () => {
    render(<ToolCallStatusIndicator status="Looking up recipe details..." />)
    expect(screen.getByText('Looking up recipe details...')).toBeTruthy()
  })

  it('renders the clock emoji', () => {
    render(<ToolCallStatusIndicator status="Searching recipes..." />)
    expect(screen.getByText('⏱')).toBeTruthy()
  })

  it('renders with any status string', () => {
    render(<ToolCallStatusIndicator status="Fetching ingredients..." />)
    expect(screen.getByText('Fetching ingredients...')).toBeTruthy()
  })
})
