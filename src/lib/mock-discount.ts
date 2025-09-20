export function generateMockDiscount(priceInCents: number): number {
  const maxVariationPercentage = 0.25; // 25%
  const maxVariationInCents = Math.floor(priceInCents * maxVariationPercentage);

  const weightedRandom = Math.pow(Math.random(), 3);

  const randomVariation = Math.floor(weightedRandom * maxVariationInCents * 2) - maxVariationInCents;

  const newPrice = priceInCents + randomVariation;

  return Math.max(1, newPrice);
}
