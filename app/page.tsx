"use client";
import { useState, useEffect } from "react";

interface User {
    id: number;
    name: string;
    email: string;
}

export default function CreateBlog() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [summary, setSummary] = useState("");
    const [userId, setUserId] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/user");
            if (res.ok) {
                const usersData = await res.json();
                setUsers(usersData);
                if (usersData.length > 0) {
                    setUserId(usersData[0].id.toString());
                }
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            alert("Please select a user.");
            return;
        }

        const res = await fetch("/api/blog", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                content,
                summary,
                userId: parseInt(userId),
            }),
        });

        if (res.ok) {
            alert("Blog created!");
            // Reset form
            setTitle("");
            setContent("");
            setSummary("");
        } else {
            alert("Error creating blog.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 w-full"
                required
            />
            <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border p-2 w-full"
                required
            />
            <input
                type="text"
                placeholder="Summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="border p-2 w-full"
            />
            {loading ? (
                <div className="border p-2 w-full text-gray-500">
                    Loading users...
                </div>
            ) : (
                <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="border p-2 w-full"
                    required
                >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                        </option>
                    ))}
                </select>
            )}
            <button type="submit" className="bg-black text-white px-4 py-2">
                Submit Blog
            </button>
        </form>
    );
}
