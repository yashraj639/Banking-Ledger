"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAccount } from "@/app/lib/api";

export default function SetupPage() {
  const router = useRouter();

  useEffect(() => {
    async function setup() {
      try {
        await createAccount();
      } catch {
        // account might already exist — ignore
      } finally {
        router.push("/dashboard");
      }
    }
    setup();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#fffaf0] flex items-center justify-center">
      <div className="bg-[#fde047] border-2 border-black px-8 py-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-center">
        <p className="font-black text-xl mb-2"> Setting up your account...</p>
        <p className="font-medium text-sm text-gray-600">
          You&apos;ll get ₹10,000 to start!
        </p>
      </div>
    </main>
  );
}
