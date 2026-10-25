// DeepSeek Flash peak rates, in USD per 1M tokens. Off-peak is half price;
// using the peak rate keeps stored cost estimates conservative.
const PRICE_PER_MILLION = {
  input: 0.3,
  output: 1.2,
} as const;

export function estimateCost(
  _model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  return (
    (inputTokens / 1_000_000) * PRICE_PER_MILLION.input +
    (outputTokens / 1_000_000) * PRICE_PER_MILLION.output
  );
}

export function hashUserId(userId: string): string {
  // Avoid passing raw user ids to the provider.
  // This is not a security boundary; it is a privacy/cache-isolation aid.
  const bytes = new TextEncoder().encode(userId);
  let hash = 2166136261;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return `u_${(hash >>> 0).toString(16)}`;
}
