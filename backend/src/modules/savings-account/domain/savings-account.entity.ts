import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../users/domain/user.entity"; // Adjust import path as needed

@Entity("savings_accounts")
export class SavingsAccount {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ generated: "increment" })
    accountNumber!: number;

    @Column("decimal", { precision: 18, scale: 2, default: 0 })
    totalBalance!: number;
}
