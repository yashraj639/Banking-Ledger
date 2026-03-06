"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAccounts,
  getBalance,
  getTransactions,
  logout,
  Transaction,
} from "@/app/lib/api";
import { DollarSign, History, Landmark } from "lucide-react";

interface Account {
  id: string;
  status: string;
  currency: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    setUserName(name);

    async function load() {
      try {
        const accounts = await getAccounts();
        if (accounts.length === 0) {
          router.push("/setup");
          return;
        }
        const acc = accounts[0];
        setAccount(acc);

        const [bal, txns] = await Promise.all([
          getBalance(acc.id),
          getTransactions(),
        ]);
        setBalance(bal);
        setTransactions(txns);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf0] flex items-center justify-center">
        <div className="bg-[#fde047] border-2 border-black px-6 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-black text-lg animate-pulse">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf0] p-4 md:p-8">
      {/* Navbar */}
      <nav className="flex items-center justify-between mb-8 pb-4 border-b-2 border-black">
        <div className="bg-[#fde047] border-2 border-black px-3 py-1 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <Landmark />
            <span className="font-black text-lg"> ZENO</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm hidden sm:block">
            Hey, {userName}!
          </span>
          <button
            onClick={handleLogout}
            className="border-2 border-black px-3 py-1 font-black text-sm shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Balance Card */}
        <div className="bg-[#fde047] border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">
            Total Balance
          </p>
          <p className="text-5xl font-black">
            ₹{balance !== null ? Number(balance).toLocaleString("en-IN") : "—"}
          </p>
          <p className="text-sm font-bold mt-2 opacity-60">
            Account ID:{" "}
            <span className="font-mono">{account?.id.slice(0, 8)}...</span>
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/transfer"
            className="bg-[#bbf7d0] border-2 border-black p-4 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all block"
          >
            <div className="flex flex-col items-center gap-2">
              <p className="text-2xl mb-1">
                <DollarSign />
              </p>
              <p className="font-black uppercase tracking-wider text-sm">
                Send Money
              </p>
            </div>
          </Link>
          <div className="bg-[#a5f3fc] border-2 border-black p-4 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col items-center gap-2">
              <p className="text-2xl mb-1">
                <History />
              </p>
              <p className="font-black uppercase tracking-wider text-sm">
                History Below
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="bg-black text-white px-2 py-0.5 text-sm">TXN</span>
            Recent Transactions
          </h2>

          {transactions.length === 0 ? (
            <div className="bg-white border-2 border-black p-6 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <p className="font-bold text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn) => {
                const isCredit = txn.toAccountId === account?.id;
                return (
                  <div
                    key={txn.id}
                    className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 border-2 border-black flex items-center justify-center font-black text-sm ${isCredit ? "bg-[#bbf7d0]" : "bg-[#fca5a5]"}`}
                      >
                        {isCredit ? "+" : "-"}
                      </div>
                      <div>
                        <p className="font-black text-sm">
                          {isCredit ? "Received" : "Sent"}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {new Date(txn.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-black text-lg ${isCredit ? "text-green-700" : "text-red-600"}`}
                      >
                        {isCredit ? "+" : "-"}₹
                        {Number(txn.amount).toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs font-bold uppercase">
                        <span
                          className={`px-1 border border-black ${txn.status === "completed" ? "bg-[#bbf7d0]" : "bg-[#fde047]"}`}
                        >
                          {txn.status}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
