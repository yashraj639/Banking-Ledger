import { NextResponse } from "next/server";
import z, { ZodError } from "zod";
import { AppError } from "@/app/lib/error";

const PG_ERRORS: Record<string, { message: string; status: number }> = {
    "23505": { message: "Resource already exists", status: 409 },
    "23503": { message: "Referenced resource not found", status: 400 },
    "23502": { message: "Missing required field", status: 400 },
    ECONNREFUSED: { message: "Database unavailable", status: 503 },
};

type Handler<TContext> = (req: Request, context: TContext) => Promise<Response>;

export function withErrorHandler<TContext>(handler: Handler<TContext>) {
    return async (req: Request, context: TContext): Promise<Response> => {
        try {
            return await handler(req, context);
        } catch (error) {
            console.error(`[${req.method}] ${req.url}`, error);

            if (error instanceof AppError) {
                return NextResponse.json(
                    { error: error.message, code: error.code },
                    { status: error.status }
                );
            }

            // Zod validation errors
            if (error instanceof ZodError) {
                return NextResponse.json(
                    { error: "Validation failed", details: z.treeifyError(error) },
                    { status: 422 }
                );
            }

            // Postgres errors
            if (error instanceof Error && "code" in error) {
                const pg = PG_ERRORS[error.code as string];
                if (pg) {
                    return NextResponse.json(
                        { error: pg.message },
                        { status: pg.status }
                    );
                }
            }

            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
    };
}