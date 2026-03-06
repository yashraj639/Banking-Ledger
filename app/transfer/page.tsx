"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAccounts, sendTransaction } from "@/app/lib/api";

export default function TransferPage() {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadAccount() {
      try {
        const accounts = await getAccounts();
        if (accounts.length > 0) setAccountId(accounts[0].id);
      } catch {
        router.push("/login");
      }
    }
    loadAccount();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const idempotencyKey = `transfer-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      await sendTransaction(accountId, toAccountId, amount, idempotencyKey);
      setSuccess(`₹${amount} sent successfully!`);
      setToAccountId("");
      setAmount("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] p-4 md:p-8">
      {/* Navbar */}
      <nav className="flex items-center justify-between mb-8 pb-4 border-b-2 border-black">
        <div className="bg-[#fde047] border-2 border-black px-3 py-1 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
          <span className="font-black text-lg"> ZENO</span>
        </div>
        <Link
          href="/dashboard"
          className="border-2 border-black px-3 py-1 font-black text-sm shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all"
        >
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="inline-block bg-[#a5f3fc] border-2 border-black px-3 py-1 mb-3 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            <span className="font-black text-sm uppercase tracking-wider">
              Transfer
            </span>
          </div>
          <h1 className="text-4xl font-black text-black">Send Money</h1>
          <p className="text-gray-600 font-medium mt-1">
            Transfer funds instantly
          </p>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          {/* From account display */}
          <div className="mb-4 bg-[#f3f4f6] border-2 border-black p-3">
            <p className="text-xs font-black uppercase tracking-wider mb-1 text-gray-500">
              From Account
            </p>
            <p className="font-mono font-bold text-sm truncate">
              {accountId || "Loading..."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-black mb-1 uppercase tracking-wider">
                To Account ID
              </label>
              <input
                type="text"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                required
                placeholder="Recipient's account UUID"
                className="w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Ask the recipient for their account ID
              </p>
            </div>

            <div>
              <label className="block text-sm font-black mb-1 uppercase tracking-wider">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  placeholder="0"
                  className="w-full border-2 border-black pl-8 pr-3 py-2 font-black text-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#fca5a5] border-2 border-black px-3 py-2 text-sm font-bold">
                ✗ {error}
              </div>
            )}

            {success && (
              <div className="bg-[#bbf7d0] border-2 border-black px-3 py-2 text-sm font-bold">
                ✓ {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !accountId}
              className="w-full bg-[#a5f3fc] border-2 border-black py-3 font-black text-lg uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Money →"}
            </button>
          </form>
        </div>

        {/* Info box */}
        <div className="mt-4 border-2 border-black p-4 bg-[#fde047] shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-wider mb-1">
            How it works
          </p>
          <p className="text-sm font-medium">
            Transfers are instant and atomic. Each transfer has a unique
            idempotency key — retrying won&apos;t create duplicates.
          </p>
        </div>
      </div>
    </main>
  );
}
