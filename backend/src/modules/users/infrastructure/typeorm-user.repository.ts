import { Repository } from "typeorm";
import { User } from "../domain/user.entity";
import { IUserRepository } from "../domain/user.repository";
import { AppDataSource } from "../../../shared/infrastructure/persistence/data-source";

export class TypeOrmUserRepository implements IUserRepository {
    private readonly repo: Repository<User>;

    constructor() {
        this.repo = AppDataSource.getRepository(User);
    }

    async findAll(): Promise<User[]> {
        return this.repo.find();
    }

    async findById(id: string): Promise<User | null> {
        return this.repo.findOneBy({ id });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repo.findOneBy({ email });
    }

    async save(data: Partial<User>): Promise<User> {
        const user = this.repo.create(data);
        return this.repo.save(user);
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        const user = await this.repo.findOneBy({ id });
        if (!user) return null;
        Object.assign(user, data);
        return this.repo.save(user);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repo.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
