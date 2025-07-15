import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function translateToUrdu(text: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Translate the following English text to Urdu. Return only the translated text without any additional formatting or explanations:

${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        const translatedText = await translateToUrdu(text);

        return NextResponse.json({
            success: true,
            data: {
                originalText: text,
                translatedText: translatedText,
            },
        });
    } catch (error: any) {
        console.error("Translation error:", error);
        return NextResponse.json(
            { error: "Failed to translate text" },
            { status: 500 }
        );
    }
}
