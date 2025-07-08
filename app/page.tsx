"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    userFirstName: "",
    referredUserName: "",
    courseName: "",
    currency: "",
    referralAmount: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const res = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setStatus("Email sent successfully!");
    } else {
      setStatus("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary">
        Referral Email Sender
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          "userFirstName",
          "referredUserName",
          "courseName",
          "currency",
          "referralAmount",
          "email",
        ].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            value={(formData as any)[field]}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        ))}
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Email"}
        </button>
        {status && <p className="text-sm text-gray-700 mt-2">{status}</p>}
      </form>
    </main>
  );
}
