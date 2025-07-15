import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            scrapedData,
            summaryLength = "medium", // short, medium, long
        } = body;

        // Validate required fields
        if (!scrapedData || !scrapedData.content) {
            return NextResponse.json(
                {
                    error: "Scraped data with content is required for summarization.",
                },
                { status: 400 }
            );
        }

        const { title, content, author, publishDate, url } = scrapedData;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Gemini API key is not configured." },
                { status: 500 }
            );
        }

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

Title: ${title || "Untitled"}
Author: ${author || "Unknown"}
Published: ${publishDate || "Unknown"}
URL: ${url || "N/A"}

Content:
${content}

${lengthInstruction}

Please provide a well-structured summary that includes:
1. Main topic and key points
2. Important insights or findings
3. Key takeaways for readers

Make sure the summary is clear, accurate, and captures the essence of the original content.
        `.trim();

        // Generate summary using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        // Extract key points using a separate prompt
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
                summary: {
                    text: summary,
                    keyPoints: keyPoints,
                    summaryLength,
                    generatedAt: new Date().toISOString(),
                },
            },
        });
    } catch (error: any) {
        console.error("Summarization failed:", error);

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
            { error: "Failed to generate summary. Please try again." },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: "Blog Summarizer API using Gemini AI",
        usage: "Send a POST request with scraped data from /api/scrape",
        requiredFields: ["scrapedData"],
        scrapedDataFormat: {
            title: "string (optional)",
            content: "string (required)",
            author: "string (optional)",
            publishDate: "string (optional)",
            url: "string (optional)",
        },
        optionalFields: ["summaryLength"],
        summaryLengths: ["short", "medium", "long"],
    });
}
