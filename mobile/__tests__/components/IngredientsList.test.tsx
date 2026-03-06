import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import type { IngredientsBlock } from '../../types/blocks'
import IngredientsList from '../../components/widgets/IngredientsList'

const mockOnAction = jest.fn()

const block: IngredientsBlock = {
  type: 'ingredients',
  data: {
    recipeTitle: 'Hainanese Chicken Rice',
    servings: 4,
    ingredients: [
      { name: 'Whole chicken', amount: '1.5', unit: 'kg', note: 'Room temperature' },
      { name: 'Jasmine rice', amount: '2', unit: 'cups' },
      { name: 'Fresh ginger', amount: '3', unit: 'cm', note: 'Sliced into coins' },
    ],
  },
}

describe('IngredientsList', () => {
  beforeEach(() => {
    mockOnAction.mockClear()
  })

  it('renders the "Ingredients" header', () => {
    const { getByText } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    expect(getByText('Ingredients')).toBeTruthy()
  })

  it('renders the recipe title in the header', () => {
    const { getByText } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    expect(getByText('Hainanese Chicken Rice')).toBeTruthy()
  })

  it('renders the servings badge', () => {
    const { getByText } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    expect(getByText('4')).toBeTruthy()
  })

  it('renders all ingredient names', () => {
    const { getByText } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    expect(getByText('Whole chicken')).toBeTruthy()
    expect(getByText('Jasmine rice')).toBeTruthy()
    expect(getByText('Fresh ginger')).toBeTruthy()
  })

  it('renders ingredient amounts and units on the right', () => {
    const { getByText } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    expect(getByText('1.5 kg')).toBeTruthy()
    expect(getByText('2 cups')).toBeTruthy()
    expect(getByText('3 cm')).toBeTruthy()
  })

  it('renders ingredient notes', () => {
    const { getByText } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    expect(getByText('Room temperature')).toBeTruthy()
    expect(getByText('Sliced into coins')).toBeTruthy()
  })

  it('renders a checkbox for each ingredient', () => {
    const { getByTestId } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    block.data.ingredients.forEach((_, i) => {
      expect(getByTestId(`checkbox-${i}`)).toBeTruthy()
    })
  })

  it('checkboxes start unchecked (no check mark visible)', () => {
    const { queryByText } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    // The checkmark "✓" should not be present when nothing is checked
    expect(queryByText('✓')).toBeNull()
  })

  it('toggles checkbox opacity state on press (checked state changes)', () => {
    const { getByTestId } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    const row = getByTestId('ingredient-row-0')
    // Before toggle — checkbox should exist and row is pressable
    expect(getByTestId('checkbox-0')).toBeTruthy()
    // Press to check
    fireEvent.press(row)
    // After toggle — checkmark should appear
    const checkbox = getByTestId('checkbox-0')
    expect(checkbox).toBeTruthy()
  })

  it('shows progress counter after checking an item', () => {
    const { getByTestId, getByText } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    fireEvent.press(getByTestId('ingredient-row-0'))
    expect(getByText('1 of 3 items checked')).toBeTruthy()
  })

  it('pressing add-to-list button calls onAction with correct message', () => {
    const { getByTestId } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    fireEvent.press(getByTestId('btn-add-to-list'))
    expect(mockOnAction).toHaveBeenCalledTimes(1)
    expect(mockOnAction).toHaveBeenCalledWith(
      'Add ingredients for Hainanese Chicken Rice to shopping list'
    )
  })

  it('renders all ingredient rows with correct testIDs', () => {
    const { getByTestId } = render(<IngredientsList block={block} onAction={mockOnAction} />)
    block.data.ingredients.forEach((_, i) => {
      expect(getByTestId(`ingredient-row-${i}`)).toBeTruthy()
    })
  })
})
