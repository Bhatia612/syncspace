import { generateKeyBetween } from "fractional-indexing"

export const positionAfter = (lastPosition: string | null): string => {
  return generateKeyBetween(lastPosition, null)
}

export const positionBetween = (
  before: string | null,
  after: string | null
): string => {
  return generateKeyBetween(before, after)
}