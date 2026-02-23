import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyToken } from "./lib/utils/jwt";

export const middleware = async (req: NextRequest) => {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        verifyToken(token);

        return NextResponse.next();
    } catch (error) {
        console.error("[Middleware Error]", error);
        return NextResponse.redirect(new URL("/login", req.url));
    }
};

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/transactions/:path*",
    ],
};