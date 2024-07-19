import { type System, YValues } from '../src/solve-ivp';

interface IvpExample {
  title: string;
  f: System;
  range: number[];
  y0: YValues;
  exact: YValues;
}

/**
 * The exponential function \[\x' = e^t\].
 */
export const exponential: IvpExample = {
  title: "The exponential function x' = e^t",
  f: (t, x, dxdt) => {
    dxdt[0] = Math.exp(t);
  },
  range: [0, 1],
  y0: [1],
  exact: [Math.E],
};
