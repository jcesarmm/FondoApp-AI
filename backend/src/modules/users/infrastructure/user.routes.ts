import { Router } from "express";
import { UserController } from "./user.controller";
import { UserService } from "../application/user.service";
import { TypeOrmUserRepository } from "./typeorm-user.repository";
import { EventPublisher } from "../../../shared/infrastructure/messaging/event-publisher";
import { authenticate, adminOnly } from "../../../shared/infrastructure/http/middlewares/admin-only.middleware";

export function createUserRouter(): Router {
    const router = Router();

    // Dependency Injection
    const userRepository = new TypeOrmUserRepository();
    const eventPublisher = new EventPublisher();
    const userService = new UserService(userRepository, eventPublisher);
    const userController = new UserController(userService);

    // All routes require authentication
    router.use(authenticate);

    // GET routes — any authenticated user
    router.get("/", userController.getAll);
    router.get("/:id", userController.getById);

    // Mutating routes — Admin only
    router.post("/", adminOnly, userController.create);
    router.put("/:id", adminOnly, userController.update);
    router.delete("/:id", adminOnly, userController.delete);

    return router;
}
