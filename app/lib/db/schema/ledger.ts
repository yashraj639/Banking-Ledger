import {
    pgTable,
    pgEnum,
    uuid,
    timestamp,
    index,
    numeric,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { transactions } from "./transactions";

export const ledgerStatusEnum = pgEnum("ledger_status", ["credit", "debit"]);

// Ledger entries are append-only — never update or delete, only insert
export const ledger = pgTable("ledger", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    accountId: uuid("account_id")
        .notNull()
        .references(() => accounts.id),

    transactionId: uuid("transaction_id")
        .notNull()
        .references(() => transactions.id),

    status: ledgerStatusEnum("status")
        .notNull(),

    amount: numeric("amount")
        .notNull(),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
}, (table) => [
    index("ledger_account_id_idx").on(table.accountId),
    index("ledger_transaction_id_idx").on(table.transactionId),
]);