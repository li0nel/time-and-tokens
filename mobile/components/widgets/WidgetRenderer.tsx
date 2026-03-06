import React, { memo } from 'react'
import type { Block } from '../../types/blocks'
import CookSteps from './CookSteps'
import IngredientsList from './IngredientsList'
import RecipeCard from './RecipeCard'
import TextBlock from './TextBlock'

interface Props {
  block: Block
  onAction: (message: string) => void
}

/**
 * WidgetRenderer — resolves block.type to the correct component and renders it.
 * Uses a switch on the discriminant so TypeScript can narrow each branch.
 * Returns null for unknown or unregistered block types (safe fallback).
 */
function WidgetRenderer({ block, onAction }: Props) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} onAction={onAction} />
    case 'recipe_card':
      return <RecipeCard block={block} onAction={onAction} />
    case 'ingredients':
      return <IngredientsList block={block} onAction={onAction} />
    case 'cook_steps':
      return <CookSteps block={block} onAction={onAction} />
    case 'quick_replies':
      // quick_replies is rendered by the chat layer as a chip row, not a widget
      return null
    default:
      return null
  }
}

export default memo(WidgetRenderer)
