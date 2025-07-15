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
  const [translatedSummary, setTranslatedSummary] = useState<TranslationData | null>(null);
  const [translatedKeyPoints, setTranslatedKeyPoints] = useState<TranslationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      // Step 1: Scrape blog
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!scrapeRes.ok) {
        const errorData = await scrapeRes.json();
        throw new Error(errorData.error || "Failed to scrape the blog");
      }

      const scrapeResult = await scrapeRes.json();
      setScrapedData(scrapeResult.data);

      // Step 2: Summarize blog
      const summarizeRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scrapedData: scrapeResult.data,
          summaryLength,
          title: scrapeResult.data.title,
          userId: 1, // ✅ Hardcoded userId (you may make it dynamic later)
        }),
      });

      if (!summarizeRes.ok) {
        const errorData = await summarizeRes.json();
        throw new Error(errorData.error || "Failed to summarize the blog");
      }

      const summarizeResult = await summarizeRes.json();
      setSummaryData(summarizeResult.data);

      // Step 3: Translate to Urdu
      const [summaryTransRes, keyPointsTransRes] = await Promise.all([
        fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: summarizeResult.data.summary.text }),
        }),
        fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: summarizeResult.data.summary.keyPoints }),
        }),
      ]);

      if (summaryTransRes.ok) {
        const translated = await summaryTransRes.json();
        setTranslatedSummary(translated.data);
      }

      if (keyPointsTransRes.ok) {
        const translated = await keyPointsTransRes.json();
        setTranslatedKeyPoints(translated.data);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlog = async () => {
    if (!scrapedData || !summaryData) {
      setError("No blog data to save.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: scrapedData.title,
          content: scrapedData.content,
          summary: summaryData.summary.text,
          userId: 1, // ✅ Required for blog creation
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save the blog.");
      }

      alert("Blog saved successfully!");
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Blog Summarizer</h1>
        <p className="text-gray-600">Enter a blog URL to scrape and summarize</p>
      </div>

      <form onSubmit={handleScrapeAndSummarize} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="url"
            placeholder="Enter blog URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Summarize"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      {scrapedData && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Scraped Content</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Title:</strong> {scrapedData.title}</p>
            <p><strong>Author:</strong> {scrapedData.author || "Unknown"}</p>
            <p><strong>Published:</strong> {scrapedData.publishDate || "Unknown"}</p>
            <p><strong>Word Count:</strong> {scrapedData.wordCount}</p>
            <p><strong>URL:</strong> <a href={scrapedData.url} className="text-blue-600 underline" target="_blank">{scrapedData.url}</a></p>
            {scrapedData.description && (
              <p><strong>Description:</strong> {scrapedData.description}</p>
            )}
          </div>
        </div>
      )}

      {summaryData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Summary</h2>
            <button
              type="button" // Prevent form submission
              onClick={handleSaveBlog}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {saving ? "Saving..." : "Save Blog"}
            </button>
          </div>

          <div className="prose max-w-none space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-1">Summary (English)</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {summaryData.summary.text.split("\n").map((p, i) => (
                  <p key={i} className="mb-2">{p}</p>
                ))}
              </div>
            </div>

            {translatedSummary && (
              <div>
                <h3 className="text-lg font-medium mb-1">Summary (اردو)</h3>
                <div className="bg-green-50 p-4 rounded-lg" dir="rtl">
                  {translatedSummary.translatedText.split("\n").map((p, i) => (
                    <p key={i} className="mb-2">{p}</p>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-1">Key Points (English)</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                {summaryData.summary.keyPoints.split("\n").map((p, i) => (
                  <p key={i} className="mb-2">{p}</p>
                ))}
              </div>
            </div>

            {translatedKeyPoints && (
              <div>
                <h3 className="text-lg font-medium mb-1">Key Points (اردو)</h3>
                <div className="bg-indigo-50 p-4 rounded-lg" dir="rtl">
                  {translatedKeyPoints.translatedText.split("\n").map((p, i) => (
                    <p key={i} className="mb-2">{p}</p>
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
