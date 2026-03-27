import { SavingsAccount } from "./savings-account.entity";

export interface ISavingsAccountRepository {
    create(data: Partial<SavingsAccount>): Promise<SavingsAccount>;
    findByUserId(userId: string): Promise<SavingsAccount | null>;
}
