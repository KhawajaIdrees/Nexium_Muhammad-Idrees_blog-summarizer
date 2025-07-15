"use client";
import { useState, useEffect } from "react";

interface SavedBlog {
    id: number;
    title: string;
    content: string;
    summary: string | null;
    createdAt: string;
}

export default function SavedBlogs() {
    const [blogs, setBlogs] = useState<SavedBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSavedBlogs();
    }, []);

    const fetchSavedBlogs = async () => {
        try {
            const response = await fetch("/api/blog");
            if (!response.ok) {
                throw new Error("Failed to fetch saved blogs");
            }
            const data = await response.json();
            setBlogs(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteBlog = async (blogId: number) => {
        try {
            const response = await fetch(`/api/blog/${blogId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete blog");
            }
            // Remove the blog from the list
            setBlogs(blogs.filter((blog) => blog.id !== blogId));
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading saved blogs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Saved Blogs</h1>
                <p className="text-gray-600">
                    Your saved blog summaries and analyses
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {blogs.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-2">
                        No saved blogs yet
                    </h3>
                    <p className="text-gray-600">
                        Summarize a blog and save it to see it here
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {blogs.map((blog) => (
                        <div
                            key={blog.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Saved:{" "}
                                        {new Date(
                                            blog.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteBlog(blog.id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </div>

                            {blog.summary && (
                                <div className="mb-4">
                                    <h4 className="font-medium mb-2 text-gray-700">
                                        Summary:
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700">
                                            {blog.summary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium mb-2 text-gray-700">
                                    Content Preview:
                                </h4>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-gray-700 line-clamp-3">
                                        {blog.content.length > 300
                                            ? `${blog.content.substring(
                                                  0,
                                                  300
                                              )}...`
                                            : blog.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
