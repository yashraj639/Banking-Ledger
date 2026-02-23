import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { comparePassword } from "@/lib/utils/hash";
import { signToken } from "@/lib/utils/jwt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";


const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const POST = withErrorHandler(async (req: Request) => {
    const body = await req.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json(
            { error: result.error.message },
            { status: 400 }
        );
    }

    const { email, password } = result.data;

    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existingUser.length === 0) {
        return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
        );
    }

    const checkPassword = await comparePassword(password, existingUser[0].passwordHash);

    if (!checkPassword) {
        return NextResponse.json(
            { error: "Invalid password" },
            { status: 401 }
        );
    }

    const user = existingUser[0];

    const token = signToken({ userId: user.id, email: user.email });


    const response = NextResponse.json(
        { user: 
            { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                createdAt: user.createdAt 
            } 
        },
        { status: 200 }
    );

    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
    });

    return response;
})