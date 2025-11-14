import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/jx.js',
      name: 'JX',
      fileName: 'jx.min'
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.error'],
        passes: 3,
        dead_code: true,
        unused: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        if_return: true,
        join_vars: true,
        collapse_vars: true,
        reduce_vars: true
      },
      mangle: {
        toplevel: true,
        properties: {
          regex: /^_/,
          reserved: [
            'init', 'load', 'render', 'bind', 'update',
            'templates', 'handleTrigger', 'renderTemplate',
            'interpolate', 'handleLoop', 'evalCondition'
          ]
        }
      },
      format: {
        comments: false,
        beautify: false,
        preserve_annotations: true
      }
    },
    target: 'es2018'
  }
});
