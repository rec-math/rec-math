import { IS_INFINITE, IS_NORMAL, IS_SUBNORMAL } from '../constants';

import { pack, unpack, nextAfter, classify, isBigEndian } from '.';

const bigEndianPlatforms = ['darwin'];

// The smallest positive subnormal.
const DENORM_MIN = Number.MIN_VALUE;
const NORM_MIN = 2 ** -1022; // 2.2250738585072014e-308

describe('Floating point functions', () => {
  describe('endianness()', () => {
    it('should detect current endianness', () => {
      const isBig = isBigEndian();
      console.log(
        `Running on ${process.platform}`,
        'detected as',
        isBig ? 'big-endian' : 'little-endian',
      );
      const expected = bigEndianPlatforms.includes(process.platform);
      expect(isBig).toBe(expected);
    });
  });

  describe('pack()', () => {
    it('should pack ordinary values correctly', () => {
      expect(pack(0, 0, 0, 0)).toBe(0);
      // Note that toBe checks -0 correctly!
      expect(pack(1, 0, 0, 0)).toBe(-0);

      expect(pack(0, 1023, 0, 0)).toBe(1);
      expect(pack(1, 1023, 0, 0)).toBe(-1);
      expect(pack(0, 0x7fe, 0xfffff, 0xffffffff)).toBe(Number.MAX_VALUE);
      expect(pack(0, 0, 0, 1)).toBe(Number.MIN_VALUE);
      expect(pack(0, 0x3ff + 52, 0xfffff, 0xffffffff)).toBe(
        Number.MAX_SAFE_INTEGER,
      );
      expect(pack(1, 0x3ff + 52, 0xfffff, 0xffffffff)).toBe(
        Number.MIN_SAFE_INTEGER,
      );
    });

    it('should pack infinities and NaN correctly', () => {
      expect(pack(0, 0x7ff, 0, 0)).toBe(Infinity);
      expect(pack(1, 0x7ff, 0, 0)).toBe(Number.NEGATIVE_INFINITY);
      expect(pack(0, 0x7ff, 0, 1)).toBeNaN();
      expect(pack(0, 0x7ff, 1, 0)).toBeNaN();
    });
  });

  describe('unpack()', () => {
    it('should unpack ordinary values correctly', () => {
      expect(unpack(0)).toEqual([0, 0, 0, 0]);
      expect(unpack(-0)).toEqual([1, 0, 0, 0]);
      expect(unpack(1)).toEqual([0, 1023, 0, 0]);
      expect(unpack(-1)).toEqual([1, 1023, 0, 0]);
      expect(unpack(Number.MAX_VALUE)).toEqual([0, 0x7fe, 0xfffff, 0xffffffff]);
      expect(unpack(Number.MIN_VALUE)).toEqual([0, 0, 0, 1]);
      // prettier-ignore
      expect(unpack(Number.MAX_SAFE_INTEGER)).toEqual(
        [0, 0x3ff + 52, 0xfffff, 0xffffffff]);
      // prettier-ignore
      expect(unpack(Number.MIN_SAFE_INTEGER)).toEqual(
        [1, 0x3ff + 52, 0xfffff, 0xffffffff]);
    });

    it('should unpack infinities and NaN correctly', () => {
      expect(unpack(Infinity)).toEqual([0, 0x7ff, 0, 0]);
      expect(unpack(Number.NEGATIVE_INFINITY)).toEqual([1, 0x7ff, 0, 0]);
      const nan = unpack(Number.NaN);
      expect(nan[1]).toEqual(0x7ff);
      expect(nan[2] !== 0 || nan[3] !== 0).toBe(true);
    });
  });

  describe('nextAfter()', () => {
    it('should work forwards on positive numbers', () => {
      expect(nextAfter(0)).toBe(DENORM_MIN);
      expect(nextAfter(DENORM_MIN)).toBe(DENORM_MIN * 2);
      expect(nextAfter(DENORM_MIN * 2)).toBe(DENORM_MIN * 3);

      expect(nextAfter(1)).toBe(1 + Number.EPSILON);
      expect(nextAfter(2)).toBe(2 + Number.EPSILON * 2);
      expect(nextAfter(3)).toBe(3 + Number.EPSILON * 2);
      expect(nextAfter(4)).toBe(4 + Number.EPSILON * 4);

      // Check the edge case where low word overflows to high word.
      expect(nextAfter(pack(0, 100, 0, 0xffffffff))).toBe(pack(0, 100, 1, 0));

      expect(nextAfter(1.7976931348623155e308)).toBe(Number.MAX_VALUE);

      expect(nextAfter(Number.MAX_VALUE)).toBe(Infinity);

      expect(nextAfter(Infinity)).toBe(Infinity);
    });

    it('should work forwards on negative numbers', () => {
      expect(nextAfter(-0)).toBe(DENORM_MIN);
      // Note that toBe checks +0 correctly!
      expect(nextAfter(-DENORM_MIN)).toBe(0);
      expect(nextAfter(-DENORM_MIN * 2)).toBe(-DENORM_MIN);

      expect(nextAfter(-1)).toBe(-1 + Number.EPSILON / 2);
      expect(nextAfter(-2)).toBe(-2 + Number.EPSILON);
      expect(nextAfter(-3)).toBe(-3 + Number.EPSILON * 2);
      expect(nextAfter(-4)).toBe(-4 + Number.EPSILON * 2);

      // Check the edge case where low word underflows from high word.
      expect(nextAfter(pack(1, 100, 3, 0))).toBe(pack(1, 100, 2, 0xffffffff));

      expect(nextAfter(-Number.MAX_VALUE)).toBe(-1.7976931348623155e308);

      expect(nextAfter(-Infinity)).toBe(-Number.MAX_VALUE);
    });

    it('should work backwards on positive numbers', () => {
      expect(nextAfter(0, -Infinity)).toBe(-DENORM_MIN);
      expect(nextAfter(DENORM_MIN, -Infinity)).toBe(0);
      expect(nextAfter(DENORM_MIN * 2, -Infinity)).toBe(DENORM_MIN);

      // Check the edge case where low word underflows from high word.
      expect(nextAfter(pack(0, 100, 3, 0), -Infinity)).toBe(
        pack(0, 100, 2, 0xffffffff),
      );

      expect(nextAfter(1, -Infinity)).toBe(1 - Number.EPSILON / 2);
      expect(nextAfter(2, -Infinity)).toBe(2 - Number.EPSILON);
      expect(nextAfter(3, -Infinity)).toBe(3 - Number.EPSILON * 2);
      expect(nextAfter(4, -Infinity)).toBe(4 - Number.EPSILON * 2);

      expect(nextAfter(Number.MAX_VALUE, -Infinity)).toBe(
        1.7976931348623155e308,
      );

      expect(nextAfter(Infinity, -Infinity)).toBe(Number.MAX_VALUE);
    });

    it('should work backwards on negative numbers', () => {
      expect(nextAfter(-0, -Infinity)).toBe(-DENORM_MIN);
      // Note that toBe checks +0 correctly!
      expect(nextAfter(-DENORM_MIN, -Infinity)).toBe(-DENORM_MIN * 2);
      expect(nextAfter(-DENORM_MIN * 2, -Infinity)).toBe(-DENORM_MIN * 3);

      expect(nextAfter(-1, -Infinity)).toBe(-1 - Number.EPSILON);
      expect(nextAfter(-2, -Infinity)).toBe(-2 - Number.EPSILON * 2);
      expect(nextAfter(-3, -Infinity)).toBe(-3 - Number.EPSILON * 2);
      expect(nextAfter(-4, -Infinity)).toBe(-4 - Number.EPSILON * 4);

      // Check the edge case where low word overflows to high word.
      expect(nextAfter(pack(1, 100, 0, 0xffffffff), -Infinity)).toBe(
        pack(1, 100, 1, 0),
      );

      expect(nextAfter(-1.7976931348623155e308, -Infinity)).toBe(
        -Number.MAX_VALUE,
      );

      expect(nextAfter(-Number.MAX_VALUE, -Infinity)).toBe(-Infinity);

      expect(nextAfter(-Infinity, -Infinity)).toBe(-Infinity);
    });

    it('should deal with equal values', () => {
      expect(nextAfter(0, 0)).toBe(0);
      expect(nextAfter(-0, 0)).toBe(0);
      expect(nextAfter(0, -0)).toBe(0);
      expect(nextAfter(-0, -0)).toBe(0);

      expect(nextAfter(Infinity, Infinity)).toBe(Infinity);
      expect(nextAfter(Number.MAX_VALUE, Number.MAX_VALUE)).toBe(
        Number.MAX_VALUE,
      );
      expect(nextAfter(Number.MIN_VALUE, Number.MIN_VALUE)).toBe(
        Number.MIN_VALUE,
      );
      expect(nextAfter(NaN, NaN)).toBe(NaN);
    });

    // These tests were taken from the GCC repository at
    // git://gcc.gnu.org/git/gcc.git on 2024-07-18 file
    // libstdc++-v3/testsuite/26_numerics/headers/cmath/nextafter_c++23.cc
    it('should pass c++ libstandard nextafter() tests', () => {
      // T t0 = std::nextafter(T(-0.0), T(2.0));
      // VERIFY( t0 == lim::denorm_min() );
      expect(nextAfter(-0, 2)).toBe(DENORM_MIN);

      // T t1 = std::nextafter(T(), T(1.0));
      // VERIFY( t1 == lim::denorm_min() );
      expect(nextAfter(0, 1)).toBe(DENORM_MIN);

      // T t2 = std::nextafter(T(), T());
      // VERIFY( t2 == T() && !std::signbit(t2) );
      expect(nextAfter(0, 0)).toBe(0);

      // T t3 = std::nextafter(lim::denorm_min(), T(-2.0));
      // VERIFY( t3 == T() && !std::signbit(t3) );
      expect(nextAfter(DENORM_MIN, -2)).toBe(0);

      // T t4 = std::nextafter(lim::min(), T(-0.0));
      // VERIFY( std::fpclassify(t4) == FP_SUBNORMAL && t4 > T() );
      const t4 = nextAfter(NORM_MIN, -0);
      expect(classify(t4)).toBe(IS_SUBNORMAL);
      expect(t4).toBeGreaterThan(0);

      // T t5 = std::nextafter(t4, T(1.0));
      // VERIFY( t5 == lim::min() );
      // T t6 = std::nextafter(lim::min(), lim::infinity());
      // VERIFY( std::fpclassify(t6) == FP_NORMAL && t6 > lim::min() );
      // T t7 = std::nextafter(t6, -lim::infinity());
      // VERIFY( t7 == lim::min() );
      // T t8 = std::nextafter(T(16.0), T(16.5));

      // ...

      // T t30 = std::nextafter(-lim::max(), T(0.5));
      // VERIFY( std::fpclassify(t30) == FP_NORMAL && t30 > -lim::max() );
      const t30 = nextAfter(-Number.MAX_VALUE, 0.5);
      expect(classify(t30)).toBe(IS_NORMAL);
      expect(t30).toBeGreaterThan(-Number.MAX_VALUE);

      // T t31 = std::nextafter(t30, -lim::infinity());
      // VERIFY( t31 == -lim::max() );
      const t31 = nextAfter(t30, -Infinity);
      expect(t31).toBe(-Number.MAX_VALUE);

      // T t32 = std::nextafter(t31, -lim::infinity());
      // VERIFY( std::fpclassify(t32) == FP_INFINITE && std::signbit(t32) );
      const t32 = nextAfter(t31, -Infinity);
      expect(classify(t32)).toBe(IS_INFINITE);

      // T t33 = std::nextafter(-lim::infinity(), t32);
      // VERIFY( t33 == t32 );
      const t33 = nextAfter(-Infinity, t32);
      expect(t33).toBe(t32);

      // T t34 = std::nextafter(t33, T(-1.0));
      // VERIFY( t34 == -lim::max() );
      const t34 = nextAfter(t33, -1);
      expect(t34).toBe(-Number.MAX_VALUE);

      // T t35 = std::nextafter(-lim::quiet_NaN(), T());
      // VERIFY( std::fpclassify(t35) == FP_NAN );
      const t35 = nextAfter(NaN, 0);
      expect(t35).toBeNaN();

      // T t36 = std::nextafter(T(-17.0), lim::quiet_NaN());
      // VERIFY( std::fpclassify(t36) == FP_NAN );
      const t36 = nextAfter(-17, NaN);
      expect(t36).toBeNaN();

      // T t37 = std::nextafter(T(-0.0), T());
      // VERIFY( t37 == T() && !std::signbit(t37) );
      const t37 = nextAfter(-0, 0);
      expect(t37).toBe(0);
    });

    /*
    using lim = std::numeric_limits<T>;

    VERIFY( t8 > t7 );
    T t9 = std::nextafter(t8, T(15.5));
    VERIFY( t9 == T(16.0) );
    T t10 = std::nextafter(lim::max(), T(-0.5));
    VERIFY( std::fpclassify(t10) == FP_NORMAL && t10 < lim::max() );
    T t11 = std::nextafter(t10, lim::infinity());
    VERIFY( t11 == lim::max() );
    T t12 = std::nextafter(t11, lim::infinity());
    VERIFY( std::fpclassify(t12) == FP_INFINITE && !std::signbit(t12) );
    T t13 = std::nextafter(lim::infinity(), t12);
    VERIFY( t13 == t12 );
    T t14 = std::nextafter(t13, T(1.0));
    VERIFY( t14 == lim::max() );
    T t15 = std::nextafter(lim::quiet_NaN(), T());
    VERIFY( std::fpclassify(t15) == FP_NAN );
    T t16 = std::nextafter(T(17.0), lim::quiet_NaN());
    VERIFY( std::fpclassify(t16) == FP_NAN );
    T t17 = std::nextafter(T(), T(-0.0));
    VERIFY( t17 == T() && std::signbit(t17) );
    T t20 = std::nextafter(T(-0.0), T(-2.0));
    VERIFY( t20 == -lim::denorm_min() );
    T t21 = std::nextafter(T(), T(-1.0));
    VERIFY( t21 == -lim::denorm_min() );
    T t22 = std::nextafter(T(-0.0), T(-0.0));
    VERIFY( t22 == T() && std::signbit(t22) );
    T t23 = std::nextafter(-lim::denorm_min(), T(2.0));
    VERIFY( t23 == T() && std::signbit(t23) );
    T t24 = std::nextafter(-lim::min(), T());
    VERIFY( std::fpclassify(t24) == FP_SUBNORMAL && t24 < T() );
    T t25 = std::nextafter(t24, T(-1.0));
    VERIFY( t25 == -lim::min() );
    T t26 = std::nextafter(-lim::min(), -lim::infinity());
    VERIFY( std::fpclassify(t26) == FP_NORMAL && t26 < -lim::min() );
    T t27 = std::nextafter(t26, lim::infinity());
    VERIFY( t27 == -lim::min() );
    T t28 = std::nextafter(T(-16.0), T(-16.5));
    VERIFY( t28 < t27 );
    T t29 = std::nextafter(t28, T(-15.5));
    VERIFY( t29 == T(-16.0) );

    static_assert(std::nextafter(T(1.0), T(2.0)) > T(1.0));
    static_assert(std::nextafter(std::nextafter(T(1.0), T(5.0)), T(0.0)) == T(1.0));
    */
  });
});
