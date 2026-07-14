import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest is not configured with `test.globals: true` (matches the rest of
// the repo's explicit-import convention), so React Testing Library's
// auto-cleanup detection (which looks for a global `afterEach`) does not
// trigger on its own. Register it explicitly to unmount components between
// tests and avoid leaking DOM nodes/state across RTL test cases.
afterEach(() => {
  cleanup();
});
