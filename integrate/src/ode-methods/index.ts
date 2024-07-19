import { euler } from './euler';

import type { Method } from '../solve-ivp';

export const methods: Record<string, Method> = {
  euler,
};
