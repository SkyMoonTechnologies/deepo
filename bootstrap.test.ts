import { describe, expect, it } from 'bun:test';

import { toolsCorePackageName } from './packages/tools-core/src/index';

describe('monorepo bootstrap', () => {
  it('exposes tools-core package export', () => {
    expect(toolsCorePackageName).toBe('@deepo/tools-core');
  });
});
