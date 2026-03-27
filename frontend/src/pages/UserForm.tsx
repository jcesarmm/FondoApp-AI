import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { userService } from "../services/api";
import type { CreateUserDTO } from "../services/api";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function UserForm() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    const [form, setForm] = useState<CreateUserDTO & { isAdmin: boolean }>({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        isAdmin: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (isEditing && id) {
            userService.getById(id).then((user) => {
                setForm({
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    password: "",
                    isAdmin: user.isAdmin,
                });
            }).catch((err) => setError(err.message));
        }
    }, [id, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Real-time password validation
        if (name === "password") {
            if (value && !PASSWORD_REGEX.test(value)) {
                setPasswordError("Mínimo 8 caracteres, 1 mayúscula y 1 número");
            } else {
                setPasswordError("");
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validate password before submit
        if (form.password && !PASSWORD_REGEX.test(form.password)) {
            setPasswordError("Mínimo 8 caracteres, 1 mayúscula y 1 número");
            return;
        }
        if (!isEditing && !form.password) {
            setPasswordError("La contraseña es requerida");
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (isEditing && id) {
                const updateData: Record<string, any> = { ...form };
                if (!updateData.password) delete updateData.password;
                await userService.update(id, updateData);
            } else {
                await userService.create(form);
            }
            navigate("/users");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h1>
                <Link to="/users" className="btn btn-secondary">
                    ← Volver
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="form-card">
                <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Ingresa el nombre"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input
                        id="apellido"
                        name="apellido"
                        type="text"
                        value={form.apellido}
                        onChange={handleChange}
                        required
                        placeholder="Ingresa el apellido"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="correo@ejemplo.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        Contraseña {isEditing && <span className="hint">(dejar vacío para no cambiar)</span>}
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required={!isEditing}
                        placeholder="••••••••"
                        minLength={8}
                    />
                    {passwordError && <span className="field-error">{passwordError}</span>}
                    {!passwordError && form.password && (
                        <span className="field-success">✓ Contraseña válida</span>
                    )}
                </div>

                <div className="form-group form-checkbox">
                    <input
                        id="isAdmin"
                        name="isAdmin"
                        type="checkbox"
                        checked={form.isAdmin}
                        onChange={handleChange}
                    />
                    <label htmlFor="isAdmin">Administrador</label>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading || !!passwordError}>
                        {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Usuario"}
                    </button>
                    <Link to="/users" className="btn btn-secondary">
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
}
