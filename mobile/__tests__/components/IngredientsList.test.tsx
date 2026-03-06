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
      {
        name: 'Whole chicken',
        amount: '1.5',
        unit: 'kg',
        note: 'Room temperature',
      },
      { name: 'Jasmine rice', amount: '2', unit: 'cups' },
      {
        name: 'Fresh ginger',
        amount: '3',
        unit: 'cm',
        note: 'Sliced into coins',
      },
    ],
  },
}

describe('IngredientsList', () => {
  beforeEach(() => {
    mockOnAction.mockClear()
  })

  it('renders the "Ingredients" header', () => {
    const { getByText } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    expect(getByText('Ingredients')).toBeTruthy()
  })

  it('renders the recipe title in the header', () => {
    const { getByText } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    expect(getByText('Hainanese Chicken Rice')).toBeTruthy()
  })

  it('renders the servings scaler showing the default serving count', () => {
    const { getByTestId } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    expect(getByTestId('servings-label')).toBeTruthy()
    // Default servingScale equals block.data.servings (4)
    const label = getByTestId('servings-label')
    expect(label.props.children).toEqual([4, ' servings'])
  })

  it('renders all ingredient names', () => {
    const { getByText } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    expect(getByText('Whole chicken')).toBeTruthy()
    expect(getByText('Jasmine rice')).toBeTruthy()
    expect(getByText('Fresh ginger')).toBeTruthy()
  })

  it('renders ingredient amounts and units at the default scale (1x)', () => {
    const { getByText } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    expect(getByText('1.5 kg')).toBeTruthy()
    expect(getByText('2 cups')).toBeTruthy()
    expect(getByText('3 cm')).toBeTruthy()
  })

  it('renders ingredient notes', () => {
    const { getByText } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    expect(getByText('Room temperature')).toBeTruthy()
    expect(getByText('Sliced into coins')).toBeTruthy()
  })

  it('renders a checkbox for each ingredient', () => {
    const { getByTestId } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    block.data.ingredients.forEach((_, i) => {
      expect(getByTestId(`checkbox-${i}`)).toBeTruthy()
    })
  })

  it('checkboxes start unchecked (no check mark visible)', () => {
    const { queryByText } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    // The checkmark "✓" should not be present when nothing is checked
    expect(queryByText('✓')).toBeNull()
  })

  it('toggles checkbox opacity state on press (checked state changes)', () => {
    const { getByTestId } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
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
    const { getByTestId } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    fireEvent.press(getByTestId('btn-add-to-list'))
    expect(mockOnAction).toHaveBeenCalledTimes(1)
    expect(mockOnAction).toHaveBeenCalledWith(
      'Add ingredients for Hainanese Chicken Rice to shopping list'
    )
  })

  it('renders all ingredient rows with correct testIDs', () => {
    const { getByTestId } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    block.data.ingredients.forEach((_, i) => {
      expect(getByTestId(`ingredient-row-${i}`)).toBeTruthy()
    })
  })

  // --- Serve scaler tests ---

  it('renders increment and decrement scaler buttons', () => {
    const { getByTestId } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    expect(getByTestId('btn-increment-servings')).toBeTruthy()
    expect(getByTestId('btn-decrement-servings')).toBeTruthy()
  })

  it('tapping + increments servingScale and updates the label', () => {
    const { getByTestId } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    fireEvent.press(getByTestId('btn-increment-servings'))
    const label = getByTestId('servings-label')
    expect(label.props.children).toEqual([5, ' servings'])
  })

  it('tapping − decrements servingScale and updates the label', () => {
    const { getByTestId } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    fireEvent.press(getByTestId('btn-decrement-servings'))
    const label = getByTestId('servings-label')
    expect(label.props.children).toEqual([3, ' servings'])
  })

  it('servingScale cannot go below 1', () => {
    // block.data.servings = 4, press − four times to try to reach 0
    const { getByTestId } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    const decBtn = getByTestId('btn-decrement-servings')
    fireEvent.press(decBtn)
    fireEvent.press(decBtn)
    fireEvent.press(decBtn)
    fireEvent.press(decBtn)
    fireEvent.press(decBtn)
    const label = getByTestId('servings-label')
    expect(label.props.children).toEqual([1, ' servings'])
  })

  it('scales ingredient amounts when servingScale changes', () => {
    // block.data.servings = 4; increment to 8 → ratio = 2x
    const { getByTestId, getByText } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    const incBtn = getByTestId('btn-increment-servings')
    // Press 4 times to go from 4 → 8 servings
    fireEvent.press(incBtn)
    fireEvent.press(incBtn)
    fireEvent.press(incBtn)
    fireEvent.press(incBtn)
    // 1.5 kg * 2 = 3 kg (whole number)
    expect(getByText('3 kg')).toBeTruthy()
    // 2 cups * 2 = 4 cups
    expect(getByText('4 cups')).toBeTruthy()
    // 3 cm * 2 = 6 cm
    expect(getByText('6 cm')).toBeTruthy()
  })

  it('scales amounts to 1 decimal place when result is not a whole number', () => {
    // block.data.servings = 4; increment to 5 → ratio = 5/4 = 1.25
    // 1.5 * 1.25 = 1.875 → rounded to 1.9
    // 2 * 1.25 = 2.5 (1 decimal)
    // 3 * 1.25 = 3.75 → rounded to 3.8
    const { getByTestId, getByText } = render(
      <IngredientsList block={block} onAction={mockOnAction} />
    )
    fireEvent.press(getByTestId('btn-increment-servings'))
    expect(getByText('1.9 kg')).toBeTruthy()
    expect(getByText('2.5 cups')).toBeTruthy()
    expect(getByText('3.8 cm')).toBeTruthy()
  })
})
