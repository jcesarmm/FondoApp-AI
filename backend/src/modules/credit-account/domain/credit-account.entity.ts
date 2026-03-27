import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../users/domain/user.entity";

@Entity("credit_accounts")
export class CreditAccount {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column({ generated: "increment" })
    creditNumber!: number;

    @Column("decimal", { precision: 18, scale: 2, default: 0 })
    totalDebt!: number;

    @Column("decimal", { precision: 18, scale: 2, default: 0 })
    currentDebt!: number;

    @Column("decimal", { precision: 5, scale: 2 })
    interestRate!: number;

    @Column("datetimeoffset")
    createdAt!: Date;
}
