import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { IUserRepository } from "../domain/user.repository";

const JWT_SECRET = process.env.JWT_SECRET || "fondoapp-secret-key-dev";
const JWT_EXPIRES_IN = "8h";

export interface AuthTokenPayload {
    userId: string;
    email: string;
    isAdmin: boolean;
}

export class AuthService {
    constructor(private readonly userRepository: IUserRepository) {}

    async signIn(email: string, password: string): Promise<{ token: string }> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("INVALID_CREDENTIALS");
        }

        // Compare password at application layer, pass result to domain
        const passwordMatches = await bcrypt.compare(password, user.password);
        user.signIn(passwordMatches);

        const payload: AuthTokenPayload = {
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return { token };
    }
}
