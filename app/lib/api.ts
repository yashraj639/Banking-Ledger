const BASE_URL = "";

async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include", // send httpOnly cookie on every request
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
}

// ── Auth ────────────────────────────────────────────────────

export async function login(email: string, password: string) {
    // Token is set as httpOnly cookie by server — we never touch it
    // Just store display info in localStorage
    const data = await apiFetch<{ user: { id: string; name: string; email: string } }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
    );
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userName", data.user.name);
    return data.user;
}

export async function register(name: string, email: string, password: string) {
    return apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
    });
}

export function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    // Cookie is cleared server-side via /api/auth/logout
    fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => { });
}

// ── Accounts ─────────────────────────────────────────────────

export async function getAccounts() {
    const data = await apiFetch<{ data: Array<{ id: string; status: string; currency: string; createdAt: string }> }>(
        "/api/accounts"
    );
    return data.data;
}

export async function createAccount() {
    const data = await apiFetch<{ data: { id: string } }>("/api/accounts", { method: "POST" });
    return data.data;
}

export async function getBalance(accountId: string) {
    const data = await apiFetch<{ data: number }>(`/api/accounts/${accountId}/balance`);
    return data.data;
}

// ── Transactions ──────────────────────────────────────────────

export interface Transaction {
    id: string;
    fromAccountId: string;
    toAccountId: string;
    amount: string;
    status: string;
    idempotencyKey: string;
    currency: string;
    createdAt: string;
}

export async function getTransactions() {
    const data = await apiFetch<{ data: Transaction[] }>("/api/transactions");
    return data.data;
}

export async function sendTransaction(
    fromAccountId: string,
    toAccountId: string,
    amount: string,
    idempotencyKey: string
) {
    const data = await apiFetch<{ data: Transaction }>("/api/transactions", {
        method: "POST",
        body: JSON.stringify({ fromAccountId, toAccountId, amount, idempotencyKey }),
    });
    return data.data;
}
