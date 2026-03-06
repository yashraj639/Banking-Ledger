"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-[#fde047] border-2 border-black px-4 py-2 mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-2xl font-black tracking-tight">🏦 ZENO</span>
          </div>
          <h1 className="text-4xl font-black text-black leading-tight">
            Welcome
            <br />
            back.
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Sign in to your account
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
            </div>

            {error && (
              <div className="bg-[#fca5a5] border-2 border-black px-3 py-2 text-sm font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fde047] border-2 border-black py-3 font-black text-lg uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t-2 border-black text-center">
            <p className="text-sm font-medium">
              No account?{" "}
              <Link
                href="/register"
                className="font-black underline underline-offset-2 hover:text-gray-600"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
