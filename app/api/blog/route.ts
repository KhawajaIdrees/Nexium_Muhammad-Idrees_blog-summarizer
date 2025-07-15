import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    const blogs = await prisma.blog.findMany({ include: { user: true } });
    return NextResponse.json(blogs);
}

export async function POST(req: Request) {
    const body = await req.json();
    const { title, content, summary, userId } = body;

    if (!title || !content || !userId) {
        return NextResponse.json(
            { error: "title, content, and userId are required." },
            { status: 400 }
        );
    }

    try {
        // Check if user exists first
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found. Please provide a valid userId." },
                { status: 400 }
            );
        }

        const blog = await prisma.blog.create({
            data: {
                title,
                content,
                summary,
                userId,
            },
        });
        return NextResponse.json(blog);
    } catch (error) {
        console.error("Blog creation failed:", error);
        return NextResponse.json(
            {
                error: "Blog creation failed. Check userId and required fields.",
            },
            { status: 400 }
        );
    }
}
