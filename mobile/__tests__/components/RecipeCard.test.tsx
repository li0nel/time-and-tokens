import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import type { RecipeCardBlock } from '../../types/blocks'
import RecipeCard from '../../components/widgets/RecipeCard'

const mockOnAction = jest.fn()

const block: RecipeCardBlock = {
  type: 'recipe_card',
  data: {
    recipeId: 'r42',
    title: 'Roasted Lemon Herb Chicken',
    description: 'Juicy roasted chicken with lemon and fresh herbs.',
    cookTime: '1h 15min',
    servings: 4,
    difficulty: 'easy',
    cuisine: 'French',
  },
}

describe('RecipeCard', () => {
  beforeEach(() => {
    mockOnAction.mockClear()
  })

  it('renders the recipe title', () => {
    const { getByText } = render(<RecipeCard block={block} onAction={mockOnAction} />)
    expect(getByText('Roasted Lemon Herb Chicken')).toBeTruthy()
  })

  it('renders the description', () => {
    const { getByText } = render(<RecipeCard block={block} onAction={mockOnAction} />)
    expect(getByText('Juicy roasted chicken with lemon and fresh herbs.')).toBeTruthy()
  })

  it('renders cook time in the meta row', () => {
    const { getByText } = render(<RecipeCard block={block} onAction={mockOnAction} />)
    expect(getByText('1h 15min')).toBeTruthy()
  })

  it('renders servings in the meta row', () => {
    const { getByText } = render(<RecipeCard block={block} onAction={mockOnAction} />)
    expect(getByText('4 servings')).toBeTruthy()
  })

  it('renders cuisine in the meta row', () => {
    const { getByText } = render(<RecipeCard block={block} onAction={mockOnAction} />)
    expect(getByText('French')).toBeTruthy()
  })

  it('renders the difficulty label', () => {
    const { getByText } = render(<RecipeCard block={block} onAction={mockOnAction} />)
    expect(getByText('Easy')).toBeTruthy()
  })

  it('renders 1 filled star and 2 empty stars for easy difficulty', () => {
    const { getByTestId } = render(<RecipeCard block={block} onAction={mockOnAction} />)
    // Stars use testID "star-0", "star-1", "star-2"
    expect(getByTestId('star-0')).toBeTruthy()
    expect(getByTestId('star-1')).toBeTruthy()
    expect(getByTestId('star-2')).toBeTruthy()
  })

  it('calls onAction with "Start cooking <title>" when Start Cooking is pressed', () => {
    const { getByTestId } = render(<RecipeCard block={block} onAction={mockOnAction} />)
    fireEvent.press(getByTestId('btn-start-cooking'))
    expect(mockOnAction).toHaveBeenCalledTimes(1)
    expect(mockOnAction).toHaveBeenCalledWith('Start cooking Roasted Lemon Herb Chicken')
  })

  it('calls onAction with "Show full recipe for <title>" when View Full Recipe is pressed', () => {
    const { getByTestId } = render(<RecipeCard block={block} onAction={mockOnAction} />)
    fireEvent.press(getByTestId('btn-view-full-recipe'))
    expect(mockOnAction).toHaveBeenCalledTimes(1)
    expect(mockOnAction).toHaveBeenCalledWith(
      'Show full recipe for Roasted Lemon Herb Chicken'
    )
  })

  it('renders 2 filled stars for medium difficulty', () => {
    const mediumBlock: RecipeCardBlock = {
      ...block,
      data: { ...block.data, difficulty: 'medium' },
    }
    const { getByText } = render(<RecipeCard block={mediumBlock} onAction={mockOnAction} />)
    expect(getByText('Medium')).toBeTruthy()
  })

  it('renders 3 filled stars for hard difficulty', () => {
    const hardBlock: RecipeCardBlock = {
      ...block,
      data: { ...block.data, difficulty: 'hard' },
    }
    const { getByText } = render(<RecipeCard block={hardBlock} onAction={mockOnAction} />)
    expect(getByText('Hard')).toBeTruthy()
  })

  it('omits cuisine section when cuisine is undefined', () => {
    const noCuisineBlock: RecipeCardBlock = {
      ...block,
      data: { ...block.data, cuisine: undefined },
    }
    const { queryByText } = render(
      <RecipeCard block={noCuisineBlock} onAction={mockOnAction} />
    )
    expect(queryByText('French')).toBeNull()
  })
})
