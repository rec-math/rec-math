export interface Info {
  error?: Error;
  [a: string]: unknown;
}

export class RecMathError extends Error {
  info: Info = {};
  name = 'RecMathError';

  constructor(message: string, info: Info = {}) {
    const options = info.error ? { cause: info.error } : {};
    super(message, options);
    this.info = info;
  }
}
