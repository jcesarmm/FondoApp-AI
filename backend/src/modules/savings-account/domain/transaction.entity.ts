import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { SavingsAccount } from "./savings-account.entity";

export enum TransactionType {
    DEPOSIT = "DEPOSIT",
    INTEREST_DISTRIBUTION = "INTEREST_DISTRIBUTION",
    WITHDRAW = "WITHDRAW",
}

@Entity("savings_account_transactions")
export class SavingsAccountTransaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    accountId!: string;

    @ManyToOne(() => SavingsAccount)
    @JoinColumn({ name: "accountId" })
    account!: SavingsAccount;

    @Column({
        type: "varchar", // Use varchar for enum compatibility
        length: 50
    })
    type!: TransactionType;

    @Column("decimal", { precision: 18, scale: 2 })
    amount!: number;

    @Column("datetimeoffset")
    date!: Date;
}
