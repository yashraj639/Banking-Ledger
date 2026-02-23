import { NextResponse } from "next/server";

const PG_ERRORS: Record<string, { message: string; status: number }> = {
    "23505": { message: "Resource already exists", status: 409 },
    "23503": { message: "Referenced resource not found", status: 400 },
    "23502": { message: "Missing required field", status: 400 },
    "ECONNREFUSED": { message: "Database unavailable", status: 503 },
};

export function withErrorHandler(handler: (req: Request) => Promise<Response>) {
    return async (req: Request) => {
        try {
            return await handler(req);
        } catch (error) {
            console.error("[API Error]", error);

            if (error instanceof Error && "code" in error) {
                const pgError = PG_ERRORS[error.code as string];
                if (pgError) {
                    return NextResponse.json({ error: pgError.message }, { status: pgError.status });
                }
            }

            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    };
}
