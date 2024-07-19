import type { Method, Step } from '../solve-ivp';

export const euler: Method = (y0) => {
  const dydt = new Float64Array(y0);

  const eulerStep: Step = (f, t, y, h, yNext) => {
    // Get dy/dt at (t, y);
    f(t, y, dydt);
    for (let i = 0; i < y.length; ++i) {
      yNext[i] = y[i] + h * dydt[i];
    }
  };
  return eulerStep;
};
