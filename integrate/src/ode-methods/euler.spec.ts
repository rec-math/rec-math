import { solveIvp } from '..';

import { exponential } from '../../examples/ivp-examples';

describe("Euler's method", () => {
  it('should solve e^x from (0, 1) to (1, e) to 3 decimal places in 2,000 steps', () => {
    const { f, range, y0, exact } = exponential;
    const y = solveIvp(f, range, y0, { method: 'euler', fixedStep: 1 / 2000 });
    expect(y[0]).toBeCloseTo(exact[0]);
  });
});
