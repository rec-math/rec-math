import { RecMathError } from '../../core/src/rec-math-error';
import { methods } from './ode-methods';

export type System = (t: number, y: YValues, dydt: YValues) => void;

export type YValues = number[] | Float64Array;

export type Step = (
  f: System,
  t: number,
  y: YValues,
  h: number,
  yNext: YValues,
) => void;

export type Method = (y0: YValues) => Step;

export type InternalMethod = 'euler';

export interface Options {
  method: InternalMethod | Method;
  fixedStep?: number;
}

export const solveIvp = (
  f: System,
  [t0, tEnd]: number[],
  y0: YValues,
  options: Partial<Options> = {},
) => {
  // Default options.
  const settings: Options = {
    method: 'euler',
    ...options,
  };

  // Set the step method.
  let method = settings.method;
  if (typeof method === 'string') method = methods[method] ?? method;
  if (typeof method !== 'function') {
    throw new RecMathError('Method not implemented', { method });
  }
  const step = method(y0);

  // Calculate the initial step length;
  let h = options.fixedStep ?? tEnd - t0;

  let y = new Float64Array(y0);
  let yNext = new Float64Array(y);

  let t = t0;
  while (t < tEnd) {
    step(f, t, y, h, yNext);
    t += h;
    const temp = y;
    y = yNext;
    yNext = temp;
    // Adjust h near the end.
    if (t + 2 * h > tEnd) {
      if (t + h >= tEnd) {
        h = tEnd - t;
      } else {
        h = (tEnd - t) / 2;
      }
    }
  }

  return y;
};
