import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { AuthTokenPayload } from "../../../../modules/users/application/auth.service";

const JWT_SECRET = process.env.JWT_SECRET || "fondoapp-secret-key-dev";

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload;
        }
    }
}

/**
 * Middleware that verifies the JWT from the Authorization header.
 * Attaches decoded payload to req.user.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ message: "Token expired" });
            return;
        }
        res.status(401).json({ message: "Invalid token" });
    }
}

/**
 * Middleware that restricts access to admin users only.
 * Must be used after the authenticate middleware.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction): void {
    if (!req.user || !req.user.isAdmin) {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
    }
    next();
}
