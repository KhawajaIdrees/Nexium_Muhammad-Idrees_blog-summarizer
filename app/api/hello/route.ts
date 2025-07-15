import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello, your API is working!' })
} 