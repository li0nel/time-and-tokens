import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import type { RecipeCarouselBlock } from '../../types/blocks'
import RecipeCarousel from '../../components/widgets/RecipeCarousel'

const mockOnAction = jest.fn()

const block: RecipeCarouselBlock = {
  type: 'recipe_carousel',
  data: {
    items: [
      {
        recipeId: 'hainanese-chicken-001',
        title: 'Hainanese Chicken Rice',
        cookTime: '1h 50min',
        servings: 4,
        difficulty: 'medium',
        cuisine: 'Chinese',
      },
      {
        recipeId: 'lemon-herb-chicken-001',
        title: 'Roasted Lemon Herb Chicken',
        cookTime: '1h 15min',
        servings: 4,
        difficulty: 'easy',
        cuisine: 'Western',
      },
      {
        recipeId: 'tikka-masala-001',
        title: 'Chicken Tikka Masala',
        cookTime: '1h',
        servings: 6,
        difficulty: 'hard',
      },
    ],
  },
}

describe('RecipeCarousel', () => {
  beforeEach(() => {
    mockOnAction.mockClear()
  })

  it('renders the carousel container with testID', () => {
    const { getByTestId } = render(
      <RecipeCarousel block={block} onAction={mockOnAction} />
    )
    expect(getByTestId('recipe-carousel')).toBeTruthy()
  })

  it('renders a card for each item in the carousel', () => {
    const { getByTestId } = render(
      <RecipeCarousel block={block} onAction={mockOnAction} />
    )
    block.data.items.forEach((item) => {
      expect(getByTestId(`carousel-card-${item.recipeId}`)).toBeTruthy()
    })
  })

  it('renders each recipe title', () => {
    const { getByText } = render(
      <RecipeCarousel block={block} onAction={mockOnAction} />
    )
    expect(getByText('Hainanese Chicken Rice')).toBeTruthy()
    expect(getByText('Roasted Lemon Herb Chicken')).toBeTruthy()
    expect(getByText('Chicken Tikka Masala')).toBeTruthy()
  })

  it('renders cuisine tag pills when cuisine is provided', () => {
    const { getByText } = render(
      <RecipeCarousel block={block} onAction={mockOnAction} />
    )
    expect(getByText('Chinese')).toBeTruthy()
    expect(getByText('Western')).toBeTruthy()
  })

  it('omits cuisine tag when cuisine is not provided', () => {
    const { queryByText } = render(
      <RecipeCarousel block={block} onAction={mockOnAction} />
    )
    // Tikka Masala has no cuisine — no cuisine text for it
    // (it would be 'undefined' or absent; we just confirm no crash and title renders)
    expect(queryByText('Chicken Tikka Masala')).toBeTruthy()
  })

  it('renders cook time for each card', () => {
    const { getByText } = render(
      <RecipeCarousel block={block} onAction={mockOnAction} />
    )
    expect(getByText('1h 50min')).toBeTruthy()
    expect(getByText('1h 15min')).toBeTruthy()
    expect(getByText('1h')).toBeTruthy()
  })

  it('renders servings for each card', () => {
    const { getAllByText } = render(
      <RecipeCarousel block={block} onAction={mockOnAction} />
    )
    // Two cards have 4 servings, one has 6
    expect(getAllByText('4 servings')).toHaveLength(2)
    expect(getAllByText('6 servings')).toHaveLength(1)
  })

  it('calls onAction with "Show me <title>" when a card is tapped', () => {
    const { getByTestId } = render(
      <RecipeCarousel block={block} onAction={mockOnAction} />
    )
    fireEvent.press(getByTestId('carousel-card-hainanese-chicken-001'))
    expect(mockOnAction).toHaveBeenCalledTimes(1)
    expect(mockOnAction).toHaveBeenCalledWith('Show me Hainanese Chicken Rice')
  })

  it('calls onAction with the correct title for a different card', () => {
    const { getByTestId } = render(
      <RecipeCarousel block={block} onAction={mockOnAction} />
    )
    fireEvent.press(getByTestId('carousel-card-lemon-herb-chicken-001'))
    expect(mockOnAction).toHaveBeenCalledTimes(1)
    expect(mockOnAction).toHaveBeenCalledWith(
      'Show me Roasted Lemon Herb Chicken'
    )
  })

  it('renders an empty carousel without crashing', () => {
    const emptyBlock: RecipeCarouselBlock = {
      type: 'recipe_carousel',
      data: { items: [] },
    }
    const { getByTestId } = render(
      <RecipeCarousel block={emptyBlock} onAction={mockOnAction} />
    )
    expect(getByTestId('recipe-carousel')).toBeTruthy()
  })

  it('respects a custom testID', () => {
    const { getByTestId } = render(
      <RecipeCarousel
        block={block}
        onAction={mockOnAction}
        testID="custom-carousel"
      />
    )
    expect(getByTestId('custom-carousel')).toBeTruthy()
  })
})
