// rollup.config.js

// Change this for the current module.
const module = 'integrate';

import pkg from './package.json' with { type: 'json' };
import { getRollupConfig } from '../build/rollup.js';

const config = getRollupConfig({ module, pkg });

export default config;
