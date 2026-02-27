import {
    pgTable,
    pgEnum,
    uuid,
    varchar,
    timestamp,
    index,
    numeric,
} from "drizzle-orm/pg-core";
import { accounts } from "./accounts";

export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed", "reversed"]);

export const transactions = pgTable("transactions", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    fromAccountId: uuid("from_account_id")
        .notNull()
        .references(() => accounts.id),

    toAccountId: uuid("to_account_id")
        .notNull()
        .references(() => accounts.id),

    amount: numeric("amount")
        .notNull(),

    status: transactionStatusEnum("status")
        .notNull()
        .default("pending"),

    idempotencyKey: varchar("idempotency_key", { length: 255 })
        .notNull()
        .unique(),

    currency: varchar("currency", { length: 3 })
        .notNull()
        .default("INR"),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
}, (table) => [
    index("transactions_from_account_id_idx").on(table.fromAccountId),
    index("transactions_to_account_id_idx").on(table.toAccountId),
]);