import { db } from "@/app/lib/db";
import { getBalance } from "@/app/lib/db/queries/balance";
import { accounts, ledger, transactions } from "@/app/lib/db/schema";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/errors/error";
import { withErrorHandler } from "@/app/lib/utils/api-handler";
import { sendTransactionEmail } from "@/app/lib/utils/mailer";
import { eq, or, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit Drizzle transaction
 * 10. Send email notification
 */


export const POST = withErrorHandler(async (req: Request) => {

    // 1. Validate request

    const userId = req.headers.get("x-user-id");
    if (!userId) throw new UnauthorizedError();

    const body = await req.json();
    const { fromAccountId, toAccountId, amount, idempotencyKey } = body;

    if (!fromAccountId || !toAccountId || !amount || !idempotencyKey) {
        throw new ValidationError("Missing required fields");
    }

    const [fromAccount] = await db.select().from(accounts).where(eq(accounts.id, fromAccountId));
    const [toAccount] = await db.select().from(accounts).where(eq(accounts.id, toAccountId));

    if (!fromAccount || !toAccount) throw new NotFoundError("Account");

    // 2. Validate idempotency key
    const [existingTransaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.idempotencyKey, idempotencyKey));

    if (existingTransaction) {
        if (existingTransaction.status === "completed") {
            return NextResponse.json({ message: "Transaction already completed", data: existingTransaction }, { status: 200 });
        }
        if (existingTransaction.status === "failed") {
            throw new ValidationError("Transaction failed, please try again");
        }
        if (existingTransaction.status === "pending") {
            throw new ValidationError("Transaction is still pending, please wait");
        }
        if (existingTransaction.status === "reversed") {
            throw new ValidationError("Transaction was reversed");
        }
    }

    // 3. Check account status

    if (fromAccount.status !== "active" || toAccount.status !== "active") {
        throw new ValidationError("Both accounts must be active to process a transaction");
    }

    // 4. Derive sender balance from ledger

    const balance = await getBalance(fromAccountId);

    if (balance < amount) {
        throw new ValidationError(`Insufficient balance. Available balance: ${balance}`);
    }

    // 5. Create transaction (PENDING)
    await db.transaction(async (tx) => {
        const [transaction] = await tx.insert(transactions).values({
            fromAccountId,
            toAccountId,
            amount,
            idempotencyKey,
            status: "pending",
        }).returning();

        // 6. Create DEBIT ledger entry
        await tx.insert(ledger).values({
            accountId: fromAccountId,
            transactionId: transaction.id,
            status: "debit",
            amount,
        })

        // 7. Create CREDIT ledger entry
        await tx.insert(ledger).values({
            accountId: toAccountId,
            transactionId: transaction.id,
            status: "credit",
            amount,
        })

        // 8. Mark transaction COMPLETED
        await tx.update(transactions).set({
            status: "completed",
        }).where(eq(transactions.id, transaction.id))
    })

    // 10. Send email notification
    await sendTransactionEmail(fromAccountId, toAccountId, amount);

    return NextResponse.json({ success: true }, { status: 201 });

});

export const GET = withErrorHandler(async (req: Request) => {
    const userId = req.headers.get("x-user-id");
    if (!userId) throw new UnauthorizedError();

    const userAccounts = await db.select().from(accounts).where(eq(accounts.userId, userId));
    const accountIds = userAccounts.map(a => a.id);

    if (accountIds.length === 0) {
        return NextResponse.json({ success: true, data: [] });
    }

    const history = await db
        .select()
        .from(transactions)
        .where(
            or(
                inArray(transactions.fromAccountId, accountIds),
                inArray(transactions.toAccountId, accountIds)
            )
        );

    return NextResponse.json({ success: true, data: history });
});