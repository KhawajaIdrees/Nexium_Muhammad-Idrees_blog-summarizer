import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            url,
            summaryLength = "medium", // short, medium, long
        } = body;

        if (!url) {
            return NextResponse.json(
                { error: "URL is required." },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Gemini API key is not configured." },
                { status: 500 }
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

        // Step 1: Scrape the blog
        console.log("Scraping blog:", url);
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

        // Extract content
        let content = "";
        $("script, style, nav, header, footer, aside").remove();

        const mainContent = $(
            "main, article, .content, .post-content, .entry-content, .blog-content, #content, .main-content"
        );

        if (mainContent.length > 0) {
            content = mainContent.text().trim();
        } else {
            content = $("p")
                .map((_, el) => $(el).text().trim())
                .get()
                .join("\n\n");
        }

        content = content
            .replace(/\s+/g, " ")
            .replace(/\n\s*\n/g, "\n\n")
            .trim();

        // Extract metadata
        const description =
            $('meta[name="description"]').attr("content") ||
            $('meta[property="og:description"]').attr("content") ||
            "";

        const author =
            $('meta[name="author"]').attr("content") ||
            $('.author, .byline, [rel="author"]').text().trim() ||
            "";

        const publishDate =
            $('meta[property="article:published_time"]').attr("content") ||
            $("time[datetime]").attr("datetime") ||
            $(".date, .published, .post-date").text().trim() ||
            "";

        // Step 2: Generate summary using Gemini
        console.log("Generating summary...");

        // Determine summary length
        let lengthInstruction = "";
        switch (summaryLength) {
            case "short":
                lengthInstruction =
                    "Create a concise summary in 2-3 sentences.";
                break;
            case "long":
                lengthInstruction =
                    "Create a detailed summary in 4-6 paragraphs.";
                break;
            default: // medium
                lengthInstruction =
                    "Create a comprehensive summary in 3-4 paragraphs.";
                break;
        }

        // Prepare the prompt
        const prompt = `
Please analyze and summarize the following blog post:

Title: ${title}
Author: ${author || "Unknown"}
Published: ${publishDate || "Unknown"}
URL: ${url}

Content:
${content}

${lengthInstruction}

Please provide a well-structured summary that includes:
1. Main topic and key points
2. Important insights or findings
3. Key takeaways for readers

Make sure the summary is clear, accurate, and captures the essence of the original content.
        `.trim();

        // Generate summary
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response2 = await result.response;
        const summary = response2.text();

        // Extract key points
        const keyPointsPrompt = `
Based on the following blog content, extract 3-5 key points or main takeaways:

${content}

Please provide the key points in a bullet-point format.
        `;

        const keyPointsResult = await model.generateContent(keyPointsPrompt);
        const keyPointsResponse = await keyPointsResult.response;
        const keyPoints = keyPointsResponse.text();

        return NextResponse.json({
            success: true,
            data: {
                scrapedData: {
                    url,
                    title,
                    content,
                    description,
                    author,
                    publishDate,
                    wordCount: content.split(/\s+/).length,
                    scrapedAt: new Date().toISOString(),
                },
                summary: {
                    text: summary,
                    keyPoints: keyPoints,
                    summaryLength,
                    generatedAt: new Date().toISOString(),
                },
            },
        });
    } catch (error: any) {
        console.error("Scrape and summarize failed:", error);

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

        if (error.message?.includes("API_KEY")) {
            return NextResponse.json(
                { error: "Invalid or missing Gemini API key." },
                { status: 401 }
            );
        }

        if (error.message?.includes("quota")) {
            return NextResponse.json(
                { error: "API quota exceeded. Please try again later." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                error: "Failed to scrape and summarize the blog. Please check the URL and try again.",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Blog Scraper and Summarizer API",
        usage: "Send a POST request with { url: 'https://example.com/blog-post', summaryLength: 'medium' }",
        summaryLengths: ["short", "medium", "long"],
        features: [
            "Scrapes blog content from URL",
            "Extracts title, content, author, and metadata",
            "Generates AI-powered summary using Gemini",
            "Extracts key points and takeaways",
        ],
    });
}
