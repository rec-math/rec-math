import { solveIvp } from '.';
import { RecMathError } from '../../core/src/rec-math-error';
import { exponential } from '../examples/ivp-examples';

describe('RecMath.integrate.solveIvp()', () => {
  test('a method name that does not exist should throw a RecMathError', () => {
    const { f, range, y0 } = exponential;
    expect.assertions(2);
    try {
      // @ts-expect-error we are deliberately using an invalid method name.
      solveIvp(f, range, y0, { method: 'broken', fixedStep: 1 / 2000 });
    } catch (e) {
      if (e instanceof RecMathError) {
        expect(e.message).toEqual('Method not implemented');
        expect(e.info.method).toBe('broken');
      }
    }
  });
});
