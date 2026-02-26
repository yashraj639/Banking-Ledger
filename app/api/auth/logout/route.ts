import { withErrorHandler } from "@/app/lib/utils/api-handler";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(async (req: Request) => {
    const response = NextResponse.json({
        message: "User signed out successfully",
    }, {
        status: 200
    })

    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0
    })

    return response
})