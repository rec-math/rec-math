// build/rollup.js

import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const typescriptOptions = {
  tsconfig: 'tsconfig.json',
  target: 'es2020',
  // resolveJsonModule: true,
};

export const getRollupConfig = ({ pkg, module }) => {
  const name = `RecMath.${module}`;
  const input = `${module}/src/index.ts`;

  const ts = new Date().toISOString().substring(0, 19).replace('T', ' ');

  const banner = `/*! ${pkg.name} v${pkg.version} ${ts}
 *  ${name} ${pkg.homepage}
 *  Copyright ${pkg.author} ${pkg.license} license
 */
`;
  return [
    {
      input,
      output: {
        file: `${module}/index.min.js`,
        name,
        format: 'iife',
        sourcemap: true,
        banner,
      },
      // prettier-ignore
      plugins: [
        json(),
        typescript(typescriptOptions),
        terser(),
      ],
    },
    {
      input,
      output: {
        file: `${module}/index.js`,
        format: 'esm',
        sourcemap: true,
        banner,
      },
      // prettier-ignore
      plugins: [
        json(),
        typescript(typescriptOptions),
      ],
    },
  ];
};
