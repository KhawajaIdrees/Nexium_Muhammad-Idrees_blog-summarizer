import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const blogs = await prisma.blog.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(blogs);
    } catch (error: any) {
        // If table doesn't exist, return empty array
        if (error.code === "P2021") {
            return NextResponse.json([]);
        }
        console.error("Failed to fetch blogs:", error);
        return NextResponse.json(
            { error: "Failed to fetch blogs" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, content, summary } = body;

        // Validate required fields
        if (!title || !content) {
            return NextResponse.json(
                { error: "Title and content are required." },
                { status: 400 }
            );
        }

        const blog = await prisma.blog.create({
            data: {
                title,
                content,
                summary: summary || null,
            },
        });

        return NextResponse.json({
            success: true,
            data: blog,
        });
    } catch (error: any) {
        console.error("Blog creation failed:", error);
        return NextResponse.json(
            {
                error: "Blog creation failed. Please try again.",
            },
            { status: 500 }
        );
    }
}
