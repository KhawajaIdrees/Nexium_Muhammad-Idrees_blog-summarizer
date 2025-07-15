import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const blogId = parseInt(params.id);

        if (isNaN(blogId)) {
            return NextResponse.json(
                { error: "Invalid blog ID" },
                { status: 400 }
            );
        }

        // Check if blog exists
        const existingBlog = await prisma.blog.findUnique({
            where: { id: blogId },
        });

        if (!existingBlog) {
            return NextResponse.json(
                { error: "Blog not found" },
                { status: 404 }
            );
        }

        // Delete the blog
        await prisma.blog.delete({
            where: { id: blogId },
        });

        return NextResponse.json(
            { success: true, message: "Blog deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Blog deletion failed:", error);
        return NextResponse.json(
            { error: "Failed to delete blog" },
            { status: 500 }
        );
    }
}
