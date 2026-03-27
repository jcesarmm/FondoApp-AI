import { Repository } from "typeorm";
import { SavingsAccount } from "../domain/savings-account.entity";
import { ISavingsAccountRepository } from "../domain/savings-account.repository";
import { AppDataSource } from "../../../shared/infrastructure/persistence/data-source";

export class TypeOrmSavingsAccountRepository implements ISavingsAccountRepository {
    private readonly repo: Repository<SavingsAccount>;

    constructor() {
        this.repo = AppDataSource.getRepository(SavingsAccount);
    }

    async create(data: Partial<SavingsAccount>): Promise<SavingsAccount> {
        const account = this.repo.create(data);
        return this.repo.save(account);
    }

    async findByUserId(userId: string): Promise<SavingsAccount | null> {
        return this.repo.findOneBy({ userId });
    }
}
