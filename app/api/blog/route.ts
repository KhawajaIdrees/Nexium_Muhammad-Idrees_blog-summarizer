import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(blogs);
    } catch {
        return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, content, summary, userId } = body;

        if (!title || !content || !userId) {
            return NextResponse.json(
                { error: "Title, content, and userId are required." },
                { status: 400 }
            );
        }

        const blog = await prisma.blog.create({
            data: {
                title,
                content,
                summary: summary || null,
                userId: Number(userId),
            },
        });

        return NextResponse.json({
            success: true,
            data: blog,
        });
    } catch {
        return NextResponse.json({ error: "Blog creation failed. Please try again." }, { status: 500 });
    }
}
