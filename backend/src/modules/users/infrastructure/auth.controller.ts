import { Request, Response } from "express";
import { AuthService } from "../application/auth.service";

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    signIn = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ message: "Email and password are required" });
                return;
            }

            const result = await this.authService.signIn(email, password);
            res.json(result);
        } catch (error: any) {
            if (error.message === "INVALID_CREDENTIALS") {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }
            res.status(500).json({ message: "Error during sign in" });
        }
    };
}
