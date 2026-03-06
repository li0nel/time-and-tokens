import { RECIPES, getRecipeById, getRecipeCatalog } from '../../data/recipes'

describe('recipes catalogue', () => {
  it('has exactly 50 recipes', () => {
    expect(RECIPES).toHaveLength(50)
  })

  it('all IDs are unique', () => {
    const ids = RECIPES.map((r) => r.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(50)
  })

  it('all recipes have required fields', () => {
    for (const recipe of RECIPES) {
      expect(recipe.id).toBeTruthy()
      expect(recipe.title).toBeTruthy()
      expect(recipe.description).toBeTruthy()
      expect(recipe.cookTime).toBeTruthy()
      expect(recipe.servings).toBeGreaterThan(0)
      expect(['easy', 'medium', 'hard']).toContain(recipe.difficulty)
      expect(recipe.ingredients.length).toBeGreaterThan(0)
      expect(recipe.steps.length).toBeGreaterThan(0)
      expect(recipe.tags.length).toBeGreaterThan(0)
    }
  })

  it('getRecipeById returns the correct recipe', () => {
    const recipe = getRecipeById('recipe-001')
    expect(recipe).toBeDefined()
    expect(recipe?.title).toBe('Boeuf Bourguignon')
  })

  it('getRecipeById returns undefined for unknown id', () => {
    expect(getRecipeById('recipe-999')).toBeUndefined()
  })

  it('getRecipeCatalog includes all 50 recipe titles', () => {
    const catalog = getRecipeCatalog()
    for (const recipe of RECIPES) {
      expect(catalog).toContain(recipe.title)
    }
  })
})
