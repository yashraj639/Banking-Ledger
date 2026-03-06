"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/app/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-[#bbf7d0] border-2 border-black px-4 py-2 mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-2xl font-black tracking-tight">ZENO</span>
          </div>
          <h1 className="text-4xl font-black text-black leading-tight">
            Open your
            <br />
            account.
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Get ₹10,000 on signup
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-black mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Yash Yadav"
                className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-1 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min 8 characters"
                className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
              {password.length > 0 && password.length < 8 && (
                <p className="text-xs font-bold text-red-600 mt-1">
                  {8 - password.length} more character
                  {8 - password.length !== 1 ? "s" : ""} needed
                </p>
              )}
              {password.length >= 8 && (
                <p className="text-xs font-bold text-green-700 mt-1">
                  ✓ Looks good!
                </p>
              )}
            </div>

            {error && (
              <div className="bg-[#fca5a5] border-2 border-black px-3 py-2 text-sm font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#bbf7d0] border-2 border-black py-3 font-black text-lg uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t-2 border-black text-center">
            <p className="text-sm font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-black underline underline-offset-2 hover:text-gray-600"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
