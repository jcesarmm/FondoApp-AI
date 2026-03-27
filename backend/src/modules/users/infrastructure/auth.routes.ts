import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "../application/auth.service";
import { TypeOrmUserRepository } from "./typeorm-user.repository";

export function createAuthRouter(): Router {
    const router = Router();

    // Dependency Injection
    const userRepository = new TypeOrmUserRepository();
    const authService = new AuthService(userRepository);
    const authController = new AuthController(authService);

    // Public route — no auth middleware
    router.post("/signin", authController.signIn);

    return router;
}
