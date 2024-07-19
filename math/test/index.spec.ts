import * as math from '../src';

import { version } from '../package.json';
import { getKeyTest } from '../../test/key-test';

const testKey = getKeyTest(math);

describe('The @rec-math/math entry point', () => {
  it('should expose the current version', () => {
    expect(testKey('version')).toBe(true);
    expect(math.version).toBe(version);
  });

  it('should expose classify constants', () => {
    expect(testKey('IS_INFINITE')).toBe(true);
    expect(testKey('IS_NAN')).toBe(true);
    expect(testKey('IS_NORMAL')).toBe(true);
    expect(testKey('IS_SUBNORMAL')).toBe(true);
    expect(testKey('IS_ZERO')).toBe(true);
  });

  it('should expose other fp constants', () => {
    // No longer have any!
  });

  it('should expose floating point utilities', () => {
    expect(testKey('classify')).toBe(true);
    expect(testKey('nextAfter')).toBe(true);
    expect(testKey('pack')).toBe(true);
    expect(testKey('unpack')).toBe(true);
    expect(testKey('isBigEndian')).toBe(true);
  });

  it('should not expose anything else', () => {
    expect(testKey.getUntested()).toEqual([]);
  });
});
