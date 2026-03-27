import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../../../modules/users/domain/user.entity";
import { SavingsAccount } from "../../../modules/savings-account/domain/savings-account.entity";
import { SavingsAccountTransaction } from "../../../modules/savings-account/domain/transaction.entity";
import { CreditAccount } from "../../../modules/credit-account/domain/credit-account.entity";
import { InitialMigration1771011456478 } from "./migrations/1771011456478-InitialMigration";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "1433"),
    username: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "[DB_PASSWORD]",
    database: process.env.DB_NAME || "FondoAppDB",
    synchronize: false,
    logging: true,
    entities: [User, SavingsAccount, SavingsAccountTransaction, CreditAccount],
    migrations: [InitialMigration1771011456478],
    subscribers: [],
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
});
