import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../services/api";
import type { UserDTO } from "../services/api";

export default function UserList() {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAll();
            setUsers(data);
            setError("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
        try {
            await userService.delete(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Gestión de Usuarios</h1>
                <Link to="/users/new" className="btn btn-primary">
                    + Nuevo Usuario
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Cargando usuarios...</div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <p>No hay usuarios registrados.</p>
                    <Link to="/users/new" className="btn btn-primary">
                        Crear primer usuario
                    </Link>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.nombre}</td>
                                    <td>{user.apellido}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.isAdmin ? "badge-admin" : "badge-user"}`}>
                                            {user.isAdmin ? "Admin" : "Usuario"}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <Link to={`/users/${user.id}/edit`} className="btn btn-sm btn-secondary">
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
