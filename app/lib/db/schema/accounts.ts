import {
    pgTable,
    pgEnum,
    uuid,
    varchar,
    timestamp,
    index,
} from "drizzle-orm/pg-core";
import { users } from "./user";

export const accountStatusEnum = pgEnum("account_status", ["pending", "active", "closed"]);

export const accounts = pgTable("accounts", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),

    status: accountStatusEnum("status")
        .notNull()
        .default("pending"),

    currency: varchar("currency", { length: 3 })
        .notNull()
        .default("INR"),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull(),
}, (table) => [
    index("accounts_user_id_idx").on(table.userId),
]);