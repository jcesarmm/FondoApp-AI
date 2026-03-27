import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ length: 100 })
    nombre!: string;

    @Column({ length: 100 })
    apellido!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ default: false })
    isAdmin!: boolean;

    /**
     * Validates the user data before persisting.
     * Throws descriptive errors if validation fails.
     */
    validate(): void {
        if (!this.nombre || this.nombre.trim().length === 0) {
            throw new Error("INVALID_NOMBRE");
        }
        if (!this.apellido || this.apellido.trim().length === 0) {
            throw new Error("INVALID_APELLIDO");
        }
        if (!this.email || !this.email.includes("@")) {
            throw new Error("INVALID_EMAIL");
        }
        if (this.password && !PASSWORD_REGEX.test(this.password)) {
            throw new Error("INVALID_PASSWORD");
        }
    }

    /**
     * Validates that the provided password comparison result allows sign-in.
     * The actual bcrypt comparison happens in the Application layer.
     */
    signIn(passwordMatches: boolean): boolean {
        if (!passwordMatches) {
            throw new Error("INVALID_CREDENTIALS");
        }
        return true;
    }
}
