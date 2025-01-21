import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public/widget/bundle.js')
    const fileContent = readFileSync(filePath, 'utf-8')

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Error serving widget bundle:', error)
    return new NextResponse('Error loading widget bundle', { status: 500 })
  }
} 