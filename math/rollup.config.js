// rollup.config.js

// Change this for the current module.
const module = 'math';

import pkg from './package.json' with { type: 'json' };
import { getRollupConfig } from '../build/rollup.js';

const config = getRollupConfig({ module, pkg });

export default config;
