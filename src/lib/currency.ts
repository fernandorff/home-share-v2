/**
 * Safely convert a value to number.
 * Handles Prisma Decimal fields (objects with valueOf), strings, and numbers.
 */
export function toNumber(value: number | string | { toString(): string }): number {
  if (typeof value === 'number') return value
  return Number(value)
}

/**
 * Format a number as Brazilian currency string (without R$ prefix)
 * Example: 1234.56 → "1.234,56"
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Parse a Brazilian currency string back to number
 * Example: "1.234,56" → 1234.56
 */
export function parseCurrency(str: string): number {
  const cleaned = str.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

/**
 * Currency input mask — takes raw input and returns formatted string
 * Works with cents: user types digits, mask formats automatically
 * Example: "1" → "0,01", "123" → "1,23", "123456" → "1.234,56"
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return '0,00'

  const cents = parseInt(digits, 10)
  const reais = cents / 100

  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
