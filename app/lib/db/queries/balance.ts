import { db } from "@/app/lib/db";
import { ledger } from "@/app/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getBalance(accountId: string): Promise<number> {
    const [result] = await db
        .select({
            totalCredit: sql<string>`COALESCE(SUM(CASE WHEN ${ledger.status} = 'credit' THEN ${ledger.amount} ELSE 0 END), 0)`,
            totalDebit: sql<string>`COALESCE(SUM(CASE WHEN ${ledger.status} = 'debit'  THEN ${ledger.amount} ELSE 0 END), 0)`,
        })
        .from(ledger)
        .where(eq(ledger.accountId, accountId));

    if (!result) {
        return 0;
    }

    return Number(result.totalCredit) - Number(result.totalDebit);

}
