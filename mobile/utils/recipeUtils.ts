/**
 * recipeUtils.ts
 *
 * Utility functions for recipe scaling and unit conversion.
 */

export type UnitSystem = 'metric' | 'imperial'

// ---------------------------------------------------------------------------
// Serve scaler
// ---------------------------------------------------------------------------

/**
 * Scales a numeric amount string by the ratio (toServings / fromServings).
 *
 * Returns a whole-number string when the result is an integer,
 * otherwise rounds to 1 decimal place.
 * Returns the original string unchanged if it cannot be parsed as a number.
 */
export function scaleIngredientAmount(
  amount: string,
  fromServings: number,
  toServings: number
): string {
  const parsed = parseFloat(amount)
  if (isNaN(parsed) || fromServings === 0) return amount
  const scaled = parsed * (toServings / fromServings)
  if (Number.isInteger(scaled)) return String(scaled)
  return scaled.toFixed(1)
}

// ---------------------------------------------------------------------------
// Unit conversion
// ---------------------------------------------------------------------------

/**
 * Conversion factors to a common SI base, and display precision rules.
 *
 * For each unit pair the table stores:
 *   - metricUnit   : canonical metric display label
 *   - imperialUnit : canonical imperial display label
 *   - toImperial   : multiply metric amount by this to get imperial value
 *   - toMetric     : multiply imperial amount by this to get metric value
 */
interface ConversionEntry {
  metricUnit: string
  imperialUnit: string
  toImperial: number
  toMetric: number
}

const CONVERSION_TABLE: ConversionEntry[] = [
  // Mass
  {
    metricUnit: 'g',
    imperialUnit: 'oz',
    toImperial: 0.035274,
    toMetric: 28.3495,
  },
  {
    metricUnit: 'kg',
    imperialUnit: 'lb',
    toImperial: 2.20462,
    toMetric: 0.453592,
  },
  // Volume
  {
    metricUnit: 'ml',
    imperialUnit: 'fl oz',
    toImperial: 0.033814,
    toMetric: 29.5735,
  },
  {
    metricUnit: 'l',
    imperialUnit: 'fl oz',
    toImperial: 33.814,
    toMetric: 0.0295735,
  },
  // Length
  {
    metricUnit: 'cm',
    imperialUnit: 'inch',
    toImperial: 0.393701,
    toMetric: 2.54,
  },
  {
    metricUnit: 'mm',
    imperialUnit: 'inch',
    toImperial: 0.0393701,
    toMetric: 25.4,
  },
  // Temperature (special: linear conversion, not just multiply)
  // Handled separately below.
]

// Aliases normalised to canonical labels used in CONVERSION_TABLE
const METRIC_ALIASES: Record<string, string> = {
  gram: 'g',
  grams: 'g',
  gramme: 'g',
  grammes: 'g',
  kilogram: 'kg',
  kilograms: 'kg',
  kilo: 'kg',
  kilos: 'kg',
  milliliter: 'ml',
  millilitre: 'ml',
  milliliters: 'ml',
  millilitres: 'ml',
  liter: 'l',
  litre: 'l',
  liters: 'l',
  litres: 'l',
  centimeter: 'cm',
  centimetre: 'cm',
  centimeters: 'cm',
  centimetres: 'cm',
  millimeter: 'mm',
  millimetre: 'mm',
  millimeters: 'mm',
  millimetres: 'mm',
  '°c': '°C',
  celsius: '°C',
}

const IMPERIAL_ALIASES: Record<string, string> = {
  ounce: 'oz',
  ounces: 'oz',
  pound: 'lb',
  pounds: 'lb',
  lbs: 'lb',
  'fluid ounce': 'fl oz',
  'fluid ounces': 'fl oz',
  inch: 'inch',
  inches: 'inch',
  '"': 'inch',
  in: 'inch',
  '°f': '°F',
  fahrenheit: '°F',
}

function normaliseUnit(unit: string): string {
  const lower = unit.trim().toLowerCase()
  return METRIC_ALIASES[lower] ?? IMPERIAL_ALIASES[lower] ?? unit.trim()
}

function formatConverted(value: number): string {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}

/**
 * Converts an ingredient amount + unit between metric and imperial.
 *
 * Supported conversions:
 *   g ↔ oz, kg ↔ lb, ml ↔ fl oz, l ↔ fl oz, cm ↔ inch, mm ↔ inch, °C ↔ °F
 *
 * For unsupported units the original amount and unit are returned unchanged.
 */
export function convertUnit(
  amount: string,
  unit: string,
  targetSystem: UnitSystem
): { amount: string; unit: string } {
  const parsed = parseFloat(amount)
  if (isNaN(parsed)) return { amount, unit }

  const canonical = normaliseUnit(unit)

  // --- Temperature (affine, not proportional) ---
  if (canonical === '°C' && targetSystem === 'imperial') {
    const f = (parsed * 9) / 5 + 32
    return { amount: formatConverted(f), unit: '°F' }
  }
  if (canonical === '°F' && targetSystem === 'metric') {
    const c = ((parsed - 32) * 5) / 9
    return { amount: formatConverted(c), unit: '°C' }
  }
  if (
    (canonical === '°C' && targetSystem === 'metric') ||
    (canonical === '°F' && targetSystem === 'imperial')
  ) {
    return { amount, unit: canonical }
  }

  // --- Table-based conversions ---
  for (const entry of CONVERSION_TABLE) {
    if (canonical === entry.metricUnit && targetSystem === 'imperial') {
      const converted = parsed * entry.toImperial
      return { amount: formatConverted(converted), unit: entry.imperialUnit }
    }
    if (canonical === entry.imperialUnit && targetSystem === 'metric') {
      const converted = parsed * entry.toMetric
      return { amount: formatConverted(converted), unit: entry.metricUnit }
    }
    // Already in target system — return normalised canonical form
    if (canonical === entry.metricUnit && targetSystem === 'metric') {
      return { amount, unit: canonical }
    }
    if (canonical === entry.imperialUnit && targetSystem === 'imperial') {
      return { amount, unit: canonical }
    }
  }

  // Unsupported unit — return unchanged
  return { amount, unit }
}
