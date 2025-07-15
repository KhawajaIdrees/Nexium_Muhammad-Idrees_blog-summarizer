"use client"
import { useState } from "react"

export default function CreateBlog() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [summary, setSummary] = useState("")
  const [userId, setUserId] = useState(1) // For now, hardcoded

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch("/api/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content, summary, userId }),
    })

    if (res.ok) {
      alert("Blog created!")
    } else {
      alert("Error creating blog.")
    }
  }

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
      <input
        type="number"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(Number(e.target.value))}
        className="border p-2 w-full"
        required
      />
      <button type="submit" className="bg-black text-white px-4 py-2">
        Submit Blog
      </button>
    </form>
  )
}
