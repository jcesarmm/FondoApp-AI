import { ISavingsAccountRepository } from "../domain/savings-account.repository";
import { SavingsAccount } from "../domain/savings-account.entity";

export class SavingsAccountService {
    constructor(private readonly savingsAccountRepository: ISavingsAccountRepository) { }

    async createForUser(userId: string): Promise<SavingsAccount> {
        // Check if user already has a savings account
        const existing = await this.savingsAccountRepository.findByUserId(userId);
        if (existing) {
            console.log(`[SavingsAccountService] User ${userId} already has a savings account, skipping creation.`);
            return existing;
        }

        const account = await this.savingsAccountRepository.create({
            userId,
            totalBalance: 0,
        });

        console.log(`[SavingsAccountService] Created savings account for user ${userId}, accountNumber: ${account.accountNumber}`);
        return account;
    }
}
