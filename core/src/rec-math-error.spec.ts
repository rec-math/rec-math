import { RecMathError } from './rec-math-error';

describe('RecMathError', () => {
  it('should be throwable', () => {
    const e = () => {
      throw new RecMathError('Should be throwable');
    };
    expect(e).toThrow();
  });
});
