import { db } from "@/app/lib/db";
import { accounts } from "@/app/lib/db/schema";
import { withErrorHandler } from "@/app/lib/utils/api-handler";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(async (req: Request) => {

    const userId = req.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const [account] = await db.insert(accounts).values({
        userId,
    }).returning();

    return NextResponse.json({ success: true, data: account }, { status: 201 });

});

export const GET = withErrorHandler(async (req: Request) => {

    const userId = req.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const userAccounts = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId));

    return NextResponse.json({ success: true, data: userAccounts });

});