import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { checkToken } from "@/app/lib/utils/jwt";

export const proxy = async (req: NextRequest) => {
    try {
        const token = req.cookies.get("token")?.value || req.headers.get("Authorization")?.split(" ")[1];

        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const decoded = checkToken(token);

        return NextResponse.next({
            request: {
                headers: new Headers({
                    ...Object.fromEntries(req.headers),
                    "x-user-id": decoded.userId,
                }),
            },
        });
    } catch (error) {
        console.error("[Middleware Error]", error);
        return NextResponse.redirect(new URL("/login", req.url));
    }
};

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/accounts/:path*",
        "/api/transactions/:path*",
    ],
};
