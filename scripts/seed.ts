import "dotenv/config";
import { db } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { accounts, ledger, transactions, users } from "@/app/lib/db/schema";
import bcrypt from "bcryptjs";

const SYSTEM_EMAIL = "[EMAIL_ADDRESS]";
const INITIAL_BALANCE = "10000"; // ₹10,000 (the "bank's" reserve)

async function seed() {
    console.log("Seeding system account...");

    // Create system user
    const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, SYSTEM_EMAIL));

    if (existingUser) {
        console.log("System user already exists. Skipping.");
        process.exit(0);
    }

    await db.transaction(async (tx) => {
        // 1. Create system user
        const [systemUser] = await tx
            .insert(users)
            .values({
                name: "Zeno System",
                email: SYSTEM_EMAIL,
                passwordHash: await bcrypt.hash(randomUUID(), 12),
                isActive: true,
            })
            .returning();

        // 2. Create system account (active immediately)
        const [systemAccount] = await tx
            .insert(accounts)
            .values({
                userId: systemUser.id,
                status: "active",
            })
            .returning();

        // 3. Bootstrap initial balance via a self-referencing ledger entry
        const [bootstrapTx] = await tx
            .insert(transactions)
            .values({
                fromAccountId: systemAccount.id,
                toAccountId: systemAccount.id,
                amount: INITIAL_BALANCE,
                idempotencyKey: "system-bootstrap",
                status: "completed",
            })
            .returning();

        await tx.insert(ledger).values({
            accountId: systemAccount.id,
            transactionId: bootstrapTx.id,
            status: "credit",
            amount: INITIAL_BALANCE,
        });

        console.log("✅ System user created:", systemUser.id);
        console.log("✅ System account created:", systemAccount.id);
        console.log("");
        console.log("Add this to your .env file:");
        console.log(`SYSTEM_ACCOUNT_ID=${systemAccount.id}`);
    });
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
