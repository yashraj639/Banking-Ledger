import { NotFoundError, UnauthorizedError } from "@/errors/error";
import { withErrorHandler } from "@/app/lib/utils/api-handler";
import { NextResponse } from "next/server";
import { getBalance } from "@/app/lib/db/queries/balance";
import { db } from "@/app/lib/db";
import { accounts } from "@/app/lib/db/schema";
import { and, eq } from "drizzle-orm";


export const GET = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const userId = req.headers.get("x-user-id");

    if (!userId) throw new UnauthorizedError();

    const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
    if (!account) throw new NotFoundError("Account");

    const balance = await getBalance(id);

    return NextResponse.json({ success: true, data: balance });
});
