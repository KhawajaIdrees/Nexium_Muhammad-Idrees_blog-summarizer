import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: "URL is required." },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: "Invalid URL format." },
                { status: 400 }
            );
        }

        // Fetch the webpage
        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            timeout: 10000,
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract title
        const title =
            $("title").text().trim() ||
            $("h1").first().text().trim() ||
            $('meta[property="og:title"]').attr("content") ||
            "Untitled";

        // Extract content - try multiple selectors for better coverage
        let content = "";

        // Remove script and style elements
        $("script, style, nav, header, footer, aside").remove();

        // Try to find main content area
        const mainContent = $(
            "main, article, .content, .post-content, .entry-content, .blog-content, #content, .main-content"
        );

        if (mainContent.length > 0) {
            content = mainContent.text().trim();
        } else {
            // Fallback: get all paragraph text
            content = $("p")
                .map((_, el) => $(el).text().trim())
                .get()
                .join("\n\n");
        }

        // Clean up content
        content = content
            .replace(/\s+/g, " ") // Replace multiple whitespace with single space
            .replace(/\n\s*\n/g, "\n\n") // Replace multiple newlines with double newlines
            .trim();

        // Extract meta description
        const description =
            $('meta[name="description"]').attr("content") ||
            $('meta[property="og:description"]').attr("content") ||
            "";

        // Extract author
        const author =
            $('meta[name="author"]').attr("content") ||
            $('.author, .byline, [rel="author"]').text().trim() ||
            "";

        // Extract publish date
        const publishDate =
            $('meta[property="article:published_time"]').attr("content") ||
            $("time[datetime]").attr("datetime") ||
            $(".date, .published, .post-date").text().trim() ||
            "";

        return NextResponse.json({
            success: true,
            data: {
                url,
                title,
                content,
                description,
                author,
                publishDate,
                wordCount: content.split(/\s+/).length,
                scrapedAt: new Date().toISOString(),
            },
        });
    } catch (error: any) {
        console.error("Scraping failed:", error);

        if (error.code === "ENOTFOUND") {
            return NextResponse.json(
                { error: "URL not found or unreachable." },
                { status: 404 }
            );
        }

        if (error.code === "ECONNABORTED") {
            return NextResponse.json(
                { error: "Request timeout. Please try again." },
                { status: 408 }
            );
        }

        return NextResponse.json(
            {
                error: "Failed to scrape the blog. Please check the URL and try again.",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Blog Scraper API",
        usage: "Send a POST request with { url: 'https://example.com/blog-post' }",
    });
}
