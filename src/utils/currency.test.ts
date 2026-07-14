import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats a USD amount with the $ symbol and USD suffix', () => {
    expect(formatCurrency(150, 'USD')).toBe('$150 USD');
  });

  it('converts and formats a EUR amount', () => {
    expect(formatCurrency(100, 'EUR')).toBe('€92 EUR');
  });

  it('converts and formats an ARS amount', () => {
    expect(formatCurrency(10, 'ARS')).toBe('$12,300 ARS');
  });

  it('rounds to the nearest whole unit', () => {
    expect(formatCurrency(33.4, 'USD')).toBe('$33 USD');
  });

  it('formats negative amounts with the sign before the symbol', () => {
    expect(formatCurrency(-42, 'USD')).toBe('-$42 USD');
  });
});
