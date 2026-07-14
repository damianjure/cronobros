export type Currency = 'USD' | 'EUR' | 'ARS';

const SYMBOL: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  ARS: '$',
};

// Static display rates (not live FX) — the app only needs a currency
// PREFERENCE for how amounts are shown, not real-time conversion accuracy.
const RATE_FROM_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  ARS: 1230,
};

export function formatCurrency(amountInUsd: number, currency: Currency): string {
  const converted = amountInUsd * RATE_FROM_USD[currency];
  const sign = converted < 0 ? '-' : '';
  const rounded = Math.round(Math.abs(converted));
  const withThousands = rounded.toLocaleString('en-US');
  return `${sign}${SYMBOL[currency]}${withThousands} ${currency}`;
}
