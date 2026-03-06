import { render } from '@testing-library/react-native'
import React from 'react'
import type {
  Block,
  CookStepsBlock,
  IngredientsBlock,
  RecipeCardBlock,
  TextBlock,
} from '../../types/blocks'
import WidgetRenderer from '../../components/widgets/WidgetRenderer'

const mockOnAction = jest.fn()

const textBlock: TextBlock = {
  type: 'text',
  data: { content: 'Hello world' },
}

const recipeCardBlock: RecipeCardBlock = {
  type: 'recipe_card',
  data: {
    recipeId: 'r1',
    title: 'Test Recipe',
    description: 'A tasty dish',
    cookTime: '30 min',
    servings: 2,
    difficulty: 'easy',
    cuisine: 'Italian',
  },
}

const ingredientsBlock: IngredientsBlock = {
  type: 'ingredients',
  data: {
    recipeTitle: 'Test Recipe',
    servings: 2,
    ingredients: [
      { name: 'Flour', amount: '200', unit: 'g' },
      { name: 'Egg', amount: '2', unit: 'pcs' },
    ],
  },
}

const cookStepsBlock: CookStepsBlock = {
  type: 'cook_steps',
  data: {
    recipeTitle: 'Test Recipe',
    steps: [
      { stepNumber: 1, instruction: 'Boil water', time: '5 min' },
      { stepNumber: 2, instruction: 'Add pasta' },
    ],
  },
}

const quickRepliesBlock: Block = {
  type: 'quick_replies',
  data: { replies: ['Yes', 'No'] },
}

const unknownBlock = { type: 'not_a_real_type', data: {} } as unknown as Block

describe('WidgetRenderer', () => {
  beforeEach(() => {
    mockOnAction.mockClear()
  })

  it('renders TextBlock for type "text"', () => {
    const { getByTestId } = render(
      <WidgetRenderer block={textBlock} onAction={mockOnAction} />
    )
    expect(getByTestId('text-block')).toBeTruthy()
  })

  it('renders RecipeCard for type "recipe_card"', () => {
    const { getByTestId } = render(
      <WidgetRenderer block={recipeCardBlock} onAction={mockOnAction} />
    )
    expect(getByTestId('recipe-card')).toBeTruthy()
  })

  it('renders IngredientsList for type "ingredients"', () => {
    const { getByTestId } = render(
      <WidgetRenderer block={ingredientsBlock} onAction={mockOnAction} />
    )
    expect(getByTestId('ingredients-list')).toBeTruthy()
  })

  it('renders CookSteps for type "cook_steps"', () => {
    const { getByTestId } = render(
      <WidgetRenderer block={cookStepsBlock} onAction={mockOnAction} />
    )
    expect(getByTestId('cook-steps')).toBeTruthy()
  })

  it('returns null for type "quick_replies"', () => {
    const { toJSON } = render(
      <WidgetRenderer block={quickRepliesBlock} onAction={mockOnAction} />
    )
    expect(toJSON()).toBeNull()
  })

  it('returns null for an unknown block type', () => {
    const { toJSON } = render(
      <WidgetRenderer block={unknownBlock} onAction={mockOnAction} />
    )
    expect(toJSON()).toBeNull()
  })
})
