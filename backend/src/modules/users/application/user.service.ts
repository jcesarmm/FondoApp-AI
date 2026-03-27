import * as bcrypt from "bcrypt";
import { IUserRepository } from "../domain/user.repository";
import { User } from "../domain/user.entity";
import { EventPublisher } from "../../../shared/infrastructure/messaging/event-publisher";

export class UserService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly eventPublisher: EventPublisher
    ) { }

    async findAll(): Promise<Omit<User, "password" | "validate" | "signIn">[]> {
        const users = await this.userRepository.findAll();
        return users.map(({ password, ...rest }) => rest);
    }

    async findById(id: string): Promise<Omit<User, "password" | "validate" | "signIn"> | null> {
        const user = await this.userRepository.findById(id);
        if (!user) return null;
        const { password, ...rest } = user;
        return rest;
    }

    async create(data: {
        nombre: string;
        apellido: string;
        email: string;
        password: string;
        isAdmin?: boolean;
    }): Promise<Omit<User, "password" | "validate" | "signIn">> {
        // Use entity validation
        const tempUser = new User();
        Object.assign(tempUser, data);
        tempUser.validate();

        const existing = await this.userRepository.findByEmail(data.email);
        if (existing) {
            throw new Error("EMAIL_ALREADY_EXISTS");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.userRepository.save({
            ...data,
            password: hashedPassword,
        });

        const { password, ...rest } = user;

        // Publish UserCreated event to RabbitMQ
        await this.eventPublisher.publish("user.events", "user.created", {
            userId: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
        });

        return rest;
    }

    async update(
        id: string,
        data: Partial<{ nombre: string; apellido: string; email: string; password: string; isAdmin: boolean }>
    ): Promise<Omit<User, "password" | "validate" | "signIn"> | null> {
        if (data.email) {
            const existing = await this.userRepository.findByEmail(data.email);
            if (existing && existing.id !== id) {
                throw new Error("EMAIL_ALREADY_EXISTS");
            }
        }

        if (data.password) {
            // Validate password via entity
            const tempUser = new User();
            tempUser.password = data.password;
            tempUser.validate();
            data.password = await bcrypt.hash(data.password, 10);
        }

        const user = await this.userRepository.update(id, data);
        if (!user) return null;

        const { password, ...rest } = user;
        return rest;
    }

    async delete(id: string): Promise<boolean> {
        return this.userRepository.delete(id);
    }
}
