import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(__dirname, './SimpleNavbar.vue'),
  'utf8',
);

describe('SimpleNavbar mobile menu button', () => {
  it('keeps the hamburger icon at the visible mobile size', () => {
    expect(source).toMatch(
      /class="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white\/20 hover:bg-white\/30 transition-colors duration-300 ml-1 sm:ml-2"[\s\S]*?<Icon :name="isMobileMenuOpen \? 'X' : 'Menu'" class="nav-icon w-6 h-6 text-white" \/>/,
    );
  });
});
