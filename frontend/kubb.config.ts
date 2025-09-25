import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginClient } from '@kubb/plugin-client'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginReactQuery } from '@kubb/plugin-react-query'

export default defineConfig({
  root: '.',
  input: {
    path: 'http://localhost:8000/openapi.json',
  },
  output: {
    path: './src/api',
    clean: true,
  },
  plugins: [
    pluginOas({
      validate: false,
    }),
    pluginTs({
      output: {
        path: './types',
      },
    }),
    pluginClient({
      output: {
        path: './client',
      },
      importPath: '../../lib/axios-instance',
    }),
    pluginReactQuery({
      output: {
        path: './queries',
      },
      client: {
        importPath: '../../lib/axios-instance',
      },
      query: {
        importPath: '@tanstack/react-query',
      },
    }),
  ],
})