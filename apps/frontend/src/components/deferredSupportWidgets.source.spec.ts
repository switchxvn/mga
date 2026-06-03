import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const phoneSupportSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/FloatingPhoneSupport.vue',
  'utf8',
);
const zaloSupportSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/FloatingZaloSupport.vue',
  'utf8',
);
const messengerSupportSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/components/ui/FloatingMessengerSupport.vue',
  'utf8',
);
const defaultLayoutSource = readFileSync(
  '/Users/abc/project/mga/apps/frontend/src/layouts/default.vue',
  'utf8',
);

describe('deferred support widgets', () => {
  it('loads floating support settings only after the first scroll', () => {
    expect(phoneSupportSource).toContain('deferUntilFirstScroll');
    expect(zaloSupportSource).toContain('deferUntilFirstScroll');
    expect(messengerSupportSource).toContain('deferUntilFirstScroll');
    expect(phoneSupportSource).toContain('stopDeferredPhonesLoad = deferUntilFirstScroll');
    expect(zaloSupportSource).toContain('stopDeferredZaloLoad = deferUntilFirstScroll');
    expect(messengerSupportSource).toContain('stopDeferredMessengerLoad = deferUntilFirstScroll');
  });

  it('loads footer data only when the footer area enters the viewport', () => {
    expect(defaultLayoutSource).toContain('deferUntilVisible');
    expect(defaultLayoutSource).toContain('ref="footerLoadAnchor"');
    expect(defaultLayoutSource).toContain('stopDeferredFooterLoad = deferUntilVisible');
  });
});
