import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from './utils/contrast';

const css = readFileSync(path.resolve(__dirname, './index.css'), 'utf-8');

function extractDarkTokens(): Record<string, string> {
  const block = css.match(/\.dark\s*{([^}]*)}/);
  if (!block) throw new Error('.dark theme block not found in index.css');
  const tokens: Record<string, string> = {};
  for (const declaration of block[1].split(';')) {
    const match = declaration.match(/--color-(brand-[a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/);
    if (match) tokens[match[1]] = match[2];
  }
  return tokens;
}

describe('dark theme contrast', () => {
  const tokens = extractDarkTokens();

  it.each([
    ['brand-background', 'brand-on-surface'],
    ['brand-surface', 'brand-on-surface'],
    ['brand-primary', 'brand-on-primary'],
    ['brand-surface-container', 'brand-on-surface-variant'],
  ])('%s vs %s meets WCAG AA (>= 4.5:1)', (bg, fg) => {
    expect(tokens[bg]).toBeDefined();
    expect(tokens[fg]).toBeDefined();
    expect(contrastRatio(tokens[bg], tokens[fg])).toBeGreaterThanOrEqual(4.5);
  });
});
