import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (userId: string): string => {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
    return token
}

export const checkToken = (token: string): { userId: string; } => {
    const verifyToken = jwt.verify(token, JWT_SECRET) as { userId: string }
    return verifyToken
}