import { terser } from 'rollup-plugin-terser';
import pluginTypescript from '@rollup/plugin-typescript';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import * as path from 'path';
import pkg from './package.json';

const moduleName = pkg.moduleName.replace(/^@.*\//, '');
const inputFileName = 'src/index.ts';
const author = pkg.author;
const banner = `
  /**
   * @license
   * author: ${author.name} <${author.email}> (${author.url})
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`;

export default [
  {
    input: inputFileName,
    output: [
      {
        ...getBaseOutput(),
        file: pkg.browser,
        format: 'iife',
      },
      {
        ...getBaseOutput(),
        file: pkg.browser.replace('.js', '.min.js'),
        format: 'iife',
        plugins: [terser()],
      },
    ],
    plugins: getPlugins(),
  },

  // ES
  {
    input: inputFileName,
    output: [
      {
        ...getBaseOutput(),
        file: pkg.module,
        format: 'es',
        exports: 'named',
      },
    ],
    external: getExternal(),
    plugins: getPlugins(),
  },

  // CommonJS
  {
    input: inputFileName,
    output: [
      {
        ...getBaseOutput(),
        file: pkg.main,
        format: 'cjs',
        exports: 'default',
      },
    ],
    external: getExternal(),
    plugins: getPlugins(),
  },
];

function getPlugins() {
  return [
    pluginTypescript(),
    pluginCommonjs({
      extensions: ['.js', '.ts'],
    }),
    babel({
      babelHelpers: 'bundled',
      configFile: path.resolve(__dirname, '.babelrc.js'),
    }),
    pluginNodeResolve({
      browser: false,
    }),
  ];
}

function getExternal() {
  return [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
}

function getBaseOutput() {
  return {
    name: moduleName,
    sourcemap: true,
    banner,
  };
}
