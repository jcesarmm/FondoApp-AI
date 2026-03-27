import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1771011456478 implements MigrationInterface {
    name = 'InitialMigration1771011456478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_a3ffb1c0c8416b9fc6f907b7433" DEFAULT NEWSEQUENTIALID(), "nombre" nvarchar(100) NOT NULL, "apellido" nvarchar(100) NOT NULL, "email" nvarchar(255) NOT NULL, "password" nvarchar(255) NOT NULL, "isAdmin" bit NOT NULL CONSTRAINT "DF_1e9ca59226e3cad7bbb10e7c00e" DEFAULT 0, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "savings_accounts" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_75c3ac9a54f19179f999beb9cc7" DEFAULT NEWSEQUENTIALID(), "userId" uniqueidentifier NOT NULL, "accountNumber" int NOT NULL IDENTITY(1,1), "totalBalance" decimal(18,2) NOT NULL CONSTRAINT "DF_aa85f82c48a7d5fafbcde6b6125" DEFAULT 0, CONSTRAINT "PK_75c3ac9a54f19179f999beb9cc7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "savings_account_transactions" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_c66b8b5f74bd528c3c023797393" DEFAULT NEWSEQUENTIALID(), "accountId" uniqueidentifier NOT NULL, "type" varchar(50) NOT NULL, "amount" decimal(18,2) NOT NULL, "date" datetimeoffset NOT NULL, CONSTRAINT "PK_c66b8b5f74bd528c3c023797393" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "credit_accounts" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_a81047fa386ce9ab9567c763d72" DEFAULT NEWSEQUENTIALID(), "userId" uniqueidentifier NOT NULL, "creditNumber" int NOT NULL IDENTITY(1,1), "totalDebt" decimal(18,2) NOT NULL CONSTRAINT "DF_81e5200f242c8aafec081f2a476" DEFAULT 0, "currentDebt" decimal(18,2) NOT NULL CONSTRAINT "DF_eaefa51f4f76be1321c2319dc2c" DEFAULT 0, "interestRate" decimal(5,2) NOT NULL, "createdAt" datetimeoffset NOT NULL, CONSTRAINT "PK_a81047fa386ce9ab9567c763d72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "savings_accounts" ADD CONSTRAINT "FK_1c7045be207246d99e6ce069a8a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "savings_account_transactions" ADD CONSTRAINT "FK_8e4a1c3611e95b3d74ffce0d484" FOREIGN KEY ("accountId") REFERENCES "savings_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit_accounts" ADD CONSTRAINT "FK_542ff4a1708a4ba625064ba6e9a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credit_accounts" DROP CONSTRAINT "FK_542ff4a1708a4ba625064ba6e9a"`);
        await queryRunner.query(`ALTER TABLE "savings_account_transactions" DROP CONSTRAINT "FK_8e4a1c3611e95b3d74ffce0d484"`);
        await queryRunner.query(`ALTER TABLE "savings_accounts" DROP CONSTRAINT "FK_1c7045be207246d99e6ce069a8a"`);
        await queryRunner.query(`DROP TABLE "credit_accounts"`);
        await queryRunner.query(`DROP TABLE "savings_account_transactions"`);
        await queryRunner.query(`DROP TABLE "savings_accounts"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
