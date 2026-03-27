import { Request, Response } from "express";
import { UserService } from "../application/user.service";

export class UserController {
    constructor(private readonly userService: UserService) { }

    getAll = async (_req: Request, res: Response): Promise<void> => {
        try {
            const users = await this.userService.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Error fetching users" });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            const user = await this.userService.findById(id);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Error fetching user" });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const { nombre, apellido, email, password, isAdmin } = req.body;

            if (!nombre || !apellido || !email || !password) {
                res.status(400).json({ message: "All fields are required: nombre, apellido, email, password" });
                return;
            }

            const user = await this.userService.create({ nombre, apellido, email, password, isAdmin });
            res.status(201).json(user);
        } catch (error: any) {
            if (error.message === "EMAIL_ALREADY_EXISTS") {
                res.status(409).json({ message: "Email already in use" });
                return;
            }
            if (error.message === "INVALID_PASSWORD") {
                res.status(400).json({ message: "Password must be at least 8 characters with 1 uppercase letter and 1 number" });
                return;
            }
            res.status(500).json({ message: "Error creating user" });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            const user = await this.userService.update(id, req.body);
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.json(user);
        } catch (error: any) {
            if (error.message === "EMAIL_ALREADY_EXISTS") {
                res.status(409).json({ message: "Email already in use" });
                return;
            }
            if (error.message === "INVALID_PASSWORD") {
                res.status(400).json({ message: "Password must be at least 8 characters with 1 uppercase letter and 1 number" });
                return;
            }
            res.status(500).json({ message: "Error updating user" });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id as string;
            const deleted = await this.userService.delete(id);
            if (!deleted) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error deleting user" });
        }
    };
}
