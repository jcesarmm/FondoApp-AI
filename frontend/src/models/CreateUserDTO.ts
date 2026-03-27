export interface CreateUserDTO {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    isAdmin?: boolean;
}
