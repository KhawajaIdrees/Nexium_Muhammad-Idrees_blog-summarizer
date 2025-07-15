import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const blogId = url.pathname.split("/").pop(); // Extract `id` from the URL

  const numericId = Number(blogId);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
  }

  // Proceed with deletion logic
  return NextResponse.json({ message: `Blog with ID ${numericId} deleted.` }, { status: 200 });
}
