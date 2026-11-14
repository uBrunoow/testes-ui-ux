import { afterEach, expect } from 'vitest';
import { page } from 'vitest/browser';

// Teste visual: cada story também é comparada com uma captura de referência.
afterEach(async () => {
  await expect.element(page.getByRole('button')).toMatchScreenshot({
    screenshotOptions: { animations: 'disabled' },
  });
});
