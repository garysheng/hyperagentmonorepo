import { build } from 'esbuild'
import { resolve } from 'path'

async function buildWidget() {
  try {
    // Build v1.js (embed script)
    await build({
      entryPoints: ['src/widget/embed/v1.ts'],
      bundle: true,
      outfile: 'public/widget/v1.js',
      format: 'iife',
      minify: true,
      platform: 'browser',
      target: 'es2015',
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    })

    // Build bundle.js (main widget)
    await build({
      entryPoints: ['src/widget/index.tsx'],
      bundle: true,
      outfile: 'public/widget/bundle.js',
      format: 'iife',
      minify: true,
      platform: 'browser',
      target: 'es2015',
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    })

    console.log('Widget build completed successfully!')
  } catch (error) {
    console.error('Widget build failed:', error)
    process.exit(1)
  }
}

buildWidget() 