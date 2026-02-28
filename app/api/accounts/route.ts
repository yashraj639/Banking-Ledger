import { db } from "@/app/lib/db";
import { accounts, ledger, transactions } from "@/app/lib/db/schema";
import { UnauthorizedError, ValidationError } from "@/errors/error";
import { withErrorHandler } from "@/app/lib/utils/api-handler";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const INITIAL_CREDIT = "10000"; // ₹10,000 starting balance for every new account
const SYSTEM_ACCOUNT_ID = process.env.SYSTEM_ACCOUNT_ID!;

export const POST = withErrorHandler(async (req: Request) => {

    const userId = req.headers.get("x-user-id");
    if (!userId) throw new UnauthorizedError();

    if (!SYSTEM_ACCOUNT_ID) throw new ValidationError("System account not configured");

    const newAccount = await db.transaction(async (tx) => {
        // Create the user's account
        const [account] = await tx.insert(accounts).values({
            userId,
            status: "active",
        }).returning();

        // Credit initial funds from system account
        const [initialTransaction] = await tx.insert(transactions).values({
            fromAccountId: SYSTEM_ACCOUNT_ID,
            toAccountId: account.id,
            amount: INITIAL_CREDIT,
            idempotencyKey: `initial-credit-${account.id}`,
            status: "completed",
        }).returning();

        // DEBIT system account
        await tx.insert(ledger).values({
            accountId: SYSTEM_ACCOUNT_ID,
            transactionId: initialTransaction.id,
            status: "debit",
            amount: INITIAL_CREDIT,
        });

        // CREDIT new user account
        await tx.insert(ledger).values({
            accountId: account.id,
            transactionId: initialTransaction.id,
            status: "credit",
            amount: INITIAL_CREDIT,
        });

        return account;
    });

    return NextResponse.json({ success: true, data: newAccount }, { status: 201 });

});


export const GET = withErrorHandler(async (req: Request) => {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new UnauthorizedError();

    const userAccounts = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId));

    return NextResponse.json({ success: true, data: userAccounts });
});