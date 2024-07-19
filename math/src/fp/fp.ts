// prettier-ignore
import {
  IS_INFINITE, IS_NAN, IS_NORMAL, IS_SUBNORMAL, IS_ZERO,
} from '../constants';

const scratchBuffer = new Float64Array(1);
const scratch = new DataView(scratchBuffer.buffer);

const MAX_32 = 0xffffffff;
const EXPONENT_MASK = 0x7ff00000; // 11 exponent bits.
const FRACTION_MASK = 0x000fffff; // 20 fraction bits + 32 low + 1 implied = 53 bits.

const SHIFT_EXPONENT = 20;
const SHIFT_SIGN = 31;
// const MAX_FRACTION = 0xfffffffffffff;
const MAX_EXPONENT = 0x7fe;

export const isBigEndian = () => {
  scratchBuffer[0] = 1;
  const a = new Uint32Array(scratchBuffer.buffer);
  return a[0] > 0;
};

/**
 * Classify a number.
 *
 * @param x The number to classify.
 * @returns A string constant classifying the number.
 */
export const classify = (x: number) => {
  // Parse the value, ignoring the sign.
  const [, exponent, hi, lo] = unpack(x);

  if (exponent === 0) return hi === 0 && lo === 0 ? IS_ZERO : IS_SUBNORMAL;

  if (exponent === MAX_EXPONENT + 1)
    return hi === 0 && lo === 0 ? IS_INFINITE : IS_NAN;

  return IS_NORMAL;
};

export const nextAfter = (x: number, direction = Infinity): number => {
  // Deal with NaN edge case.
  if (isNaN(x) || isNaN(direction)) return NaN;

  // Parse the value, converting -0 to 0.
  scratch.setFloat64(0, 0 + x);

  const hi = scratch.getUint32(0);
  const lo = scratch.getUint32(4);

  // Deal with increasing magnitude.
  if (x < 0 ? direction < x : direction > x) {
    if (lo < MAX_32) {
      // It is safe to increment the low word.
      scratch.setUint32(4, lo + 1);
      return scratch.getFloat64(0);
    }

    // Deal with MAX_VALUE edge case.
    if (Math.abs(x) === Number.MAX_VALUE) return x < 0 ? -Infinity : Infinity;

    // It is safe to increment the significand.
    scratch.setUint32(0, hi + 1);
    scratch.setUint32(4, 0);
    return scratch.getFloat64(0);
  }

  // Deal with equal edge case (including +-Infinity), casting -0 to 0.
  if (x === direction) return 0 + direction;

  if (lo > 0) {
    // Deal with MIN_DENORM edge case.
    if (Math.abs(x) === Number.MIN_VALUE) return 0;

    // All we have to do is decrement the low word.
    scratch.setUint32(4, lo - 1);
    return scratch.getFloat64(0);
  }

  // Deal with zero edge case.
  if (x === 0) return x < 0 ? Number.MIN_VALUE : -Number.MIN_VALUE;

  // It is safe to decrement the significand.
  scratch.setUint32(0, hi - 1);
  scratch.setUint32(4, MAX_32);
  return scratch.getFloat64(0);
};

export const pack = (
  sign: number,
  exponent: number,
  fractionHi: number,
  fractionLo: number,
) => {
  scratch.setUint32(
    0,
    (sign << SHIFT_SIGN) | (exponent << SHIFT_EXPONENT) | fractionHi,
  );
  scratch.setUint32(4, fractionLo);
  return scratch.getFloat64(0);
};

export const unpack = (input: number) => {
  scratch.setFloat64(0, input);
  const hi = scratch.getUint32(0);
  const lo = scratch.getUint32(4);
  const sign = hi >>> SHIFT_SIGN;
  const fractionHi = hi & FRACTION_MASK;
  const exponent = (hi & EXPONENT_MASK) >>> SHIFT_EXPONENT;
  return [sign, exponent, fractionHi, lo];
};
