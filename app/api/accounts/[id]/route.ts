import { db } from "@/app/lib/db";
import { accounts } from "@/app/lib/db/schema";
import { withErrorHandler } from "@/app/lib/utils/api-handler";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const userId = req.headers.get("x-user-id");

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));

    if (!account) {
        return NextResponse.json(
            { error: "Account not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true, data: account });
});
