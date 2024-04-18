import typescript from 'rollup-plugin-typescript2' // 处理typescript
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import copy from 'rollup-plugin-copy'
import terser from '@rollup/plugin-terser'

/**
 *
 */
export default [
  {
    input: 'src/index.ts',
    plugins: [
      commonjs(), // so Rollup can convert `ms` to an ES module
      json(),
      resolve(), // so Rollup can find `ms`
      typescript(), // typescript 转义
      copy({
        targets: [
          { src: 'templates', dest: 'dist' },
          { src: './package.json', dest: 'dist' },
        ],
      }),
      // terser(),
    ],
    output: [
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
        banner: '#!/usr/bin/env node',
      },
      { file: 'dist/index.esm.js', sourcemap: true, format: 'es' },
    ],
  },
]
