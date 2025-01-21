import * as esbuild from 'esbuild'
import { join } from 'path'

// Paths
const SRC_DIR = join(process.cwd(), 'src/widget')
const DIST_DIR = join(process.cwd(), 'public/widget')

// Build embed script
async function buildEmbed() {
  await esbuild.build({
    entryPoints: [join(SRC_DIR, 'embed/v1.ts')],
    outfile: join(DIST_DIR, 'v1.js'),
    bundle: true,
    minify: true,
    platform: 'browser',
    target: ['es2018'],
    format: 'iife',
  })
}

// Build main bundle
async function buildBundle() {
  await esbuild.build({
    entryPoints: [join(SRC_DIR, 'index.tsx')],
    outfile: join(DIST_DIR, 'bundle.js'),
    bundle: true,
    minify: true,
    platform: 'browser',
    target: ['es2018'],
    format: 'iife',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  })
}

// Build CSS
async function buildStyles() {
  await esbuild.build({
    entryPoints: [join(SRC_DIR, 'styles/index.css')],
    outfile: join(DIST_DIR, 'styles.css'),
    bundle: true,
    minify: true,
  })
}

// Run all builds
async function build() {
  try {
    await Promise.all([
      buildEmbed(),
      buildBundle(),
      buildStyles()
    ])
    console.log('✅ Widget built successfully')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

build() 