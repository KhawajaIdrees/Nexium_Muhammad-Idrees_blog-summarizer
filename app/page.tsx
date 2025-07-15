"use client";
import { useState } from "react";

interface ScrapedData {
    url: string;
    title: string;
    content: string;
    description: string;
    author: string;
    publishDate: string;
    wordCount: number;
    scrapedAt: string;
}

interface SummaryData {
    summary: {
        text: string;
        keyPoints: string;
        summaryLength: string;
        generatedAt: string;
    };
}

interface TranslationData {
    originalText: string;
    translatedText: string;
}

export default function BlogSummarizer() {
    const [url, setUrl] = useState("");
    const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [translatedSummary, setTranslatedSummary] =
        useState<TranslationData | null>(null);
    const [translatedKeyPoints, setTranslatedKeyPoints] =
        useState<TranslationData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const summaryLength = "short";

    const handleScrapeAndSummarize = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setScrapedData(null);
        setSummaryData(null);
        setTranslatedSummary(null);
        setTranslatedKeyPoints(null);

        try {
            // Step 1: Scrape the blog URL
            const scrapeResponse = await fetch("/api/scrape", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            if (!scrapeResponse.ok) {
                const errorData = await scrapeResponse.json();
                throw new Error(errorData.error || "Failed to scrape the blog");
            }

            const scrapeResult = await scrapeResponse.json();
            setScrapedData(scrapeResult.data);

            // Step 2: Summarize the scraped content
            const summarizeResponse = await fetch("/api/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    scrapedData: scrapeResult.data,
                    summaryLength,
                }),
            });

            if (!summarizeResponse.ok) {
                const errorData = await summarizeResponse.json();
                throw new Error(
                    errorData.error || "Failed to summarize the content"
                );
            }

            const summarizeResult = await summarizeResponse.json();
            setSummaryData(summarizeResult.data);

            // Step 3: Translate the summary and key points to Urdu
            try {
                const [
                    summaryTranslationResponse,
                    keyPointsTranslationResponse,
                ] = await Promise.all([
                    fetch("/api/translate", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            text: summarizeResult.data.summary.text,
                        }),
                    }),
                    fetch("/api/translate", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            text: summarizeResult.data.summary.keyPoints,
                        }),
                    }),
                ]);

                if (summaryTranslationResponse.ok) {
                    const summaryTranslation =
                        await summaryTranslationResponse.json();
                    setTranslatedSummary(summaryTranslation.data);
                }

                if (keyPointsTranslationResponse.ok) {
                    const keyPointsTranslation =
                        await keyPointsTranslationResponse.json();
                    setTranslatedKeyPoints(keyPointsTranslation.data);
                }
            } catch (translationError) {
                console.error("Translation failed:", translationError);
                // Don't throw error for translation failure, just log it
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Blog Summarizer</h1>
                <p className="text-gray-600">
                    Enter a blog URL to scrape and summarize its content
                </p>
            </div>

            <form onSubmit={handleScrapeAndSummarize} className="space-y-4">
                <div className="flex gap-4">
                    <input
                        type="url"
                        placeholder="Enter blog URL (e.g., https://example.com/blog-post)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing..." : "Summarize"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">
                        Scraping and summarizing...
                    </p>
                </div>
            )}

            {scrapedData && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Scraped Content
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <strong>Title:</strong> {scrapedData.title}
                        </div>
                        <div>
                            <strong>Author:</strong>{" "}
                            {scrapedData.author || "Unknown"}
                        </div>
                        <div>
                            <strong>Published:</strong>{" "}
                            {scrapedData.publishDate || "Unknown"}
                        </div>
                        <div>
                            <strong>Word Count:</strong> {scrapedData.wordCount}
                        </div>
                        <div>
                            <strong>URL:</strong>{" "}
                            <a
                                href={scrapedData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                {scrapedData.url}
                            </a>
                        </div>
                        {scrapedData.description && (
                            <div>
                                <strong>Description:</strong>{" "}
                                {scrapedData.description}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {summaryData && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                    <div className="prose max-w-none">
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-2">
                                Summary (English)
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                {summaryData.summary.text
                                    .split("\n")
                                    .map((paragraph, index) => (
                                        <p
                                            key={index}
                                            className="mb-3 last:mb-0"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                            </div>
                        </div>

                        {translatedSummary && (
                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-2">
                                    Summary (اردو)
                                </h3>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    {translatedSummary.translatedText
                                        .split("\n")
                                        .map((paragraph, index) => (
                                            <p
                                                key={index}
                                                className="mb-3 last:mb-0"
                                                dir="rtl"
                                            >
                                                {paragraph}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-2">
                                Key Points (English)
                            </h3>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                {summaryData.summary.keyPoints
                                    .split("\n")
                                    .map((point, index) => (
                                        <div
                                            key={index}
                                            className="mb-2 last:mb-0"
                                        >
                                            {point}
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {translatedKeyPoints && (
                            <div>
                                <h3 className="text-lg font-medium mb-2">
                                    Key Points (اردو)
                                </h3>
                                <div className="bg-indigo-50 p-4 rounded-lg">
                                    {translatedKeyPoints.translatedText
                                        .split("\n")
                                        .map((point, index) => (
                                            <div
                                                key={index}
                                                className="mb-2 last:mb-0"
                                                dir="rtl"
                                            >
                                                {point}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
