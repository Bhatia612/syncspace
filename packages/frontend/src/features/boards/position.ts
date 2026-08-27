import { generateKeyBetween } from "fractional-indexing"


export function positionForDrop(
  orderedPositions: string[],
  index: number
): string {
  const before = index > 0 ? orderedPositions[index - 1] : null
  const after = index < orderedPositions.length ? orderedPositions[index] : null
  return generateKeyBetween(before ?? null, after ?? null)
}