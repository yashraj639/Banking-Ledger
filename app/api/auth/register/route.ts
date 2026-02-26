import { z } from "zod";
import { withErrorHandler } from "@/lib/utils/api-handler";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { hashPassword } from "@/lib/utils/hash";
import { sendWelcomeEmail } from "@/lib/utils/mailer";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const POST = withErrorHandler(async (req: Request) => {
    const body = await req.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json(
            { error: result.error.issues[0].message },
            { status: 400 }
        );
    }

    const { name, email, password } = result.data;

    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existingUser.length > 0) {
        return NextResponse.json(
            { error: "Email already in use" },
            { status: 409 }
        );
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
        .insert(users)
        .values({ name, email, passwordHash })
        .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
        });

    // Send welcome email (non-blocking — don't await so it doesn't slow down the response)
    sendWelcomeEmail(name, email).catch((err) =>
        console.error("[Email Error]", err)
    );

    return NextResponse.json(
        { user: newUser, message: "Account created! Welcome to Zeno." },
        { status: 201 }
    );
})