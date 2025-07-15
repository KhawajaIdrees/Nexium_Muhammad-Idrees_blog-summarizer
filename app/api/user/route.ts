import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email } = body

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
  }

  try {
    const user = await prisma.user.create({
      data: { name, email }
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'User creation failed. Email may already exist.' }, { status: 400 });
  }
}
