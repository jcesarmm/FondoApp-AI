import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import UserList from "./pages/UserList";
import UserForm from "./pages/UserForm";
import LoginPage from "./pages/LoginPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function AppLayout() {
    const { isAuthenticated, user, logout } = useAuth();

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <div className="app-layout">
            <nav className="sidebar">
                <div className="sidebar-brand">
                    <h2>FondoApp</h2>
                    <span className="sidebar-subtitle">Fondo de Ahorro Familiar</span>
                </div>
                <ul className="sidebar-nav">
                    <li>
                        <Link to="/users" className="nav-link">
                            <span className="nav-icon">👥</span>
                            Usuarios
                        </Link>
                    </li>
                </ul>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <span className="sidebar-user-email">{user?.email}</span>
                        <span className={`badge ${user?.isAdmin ? "badge-admin" : "badge-user"}`}>
                            {user?.isAdmin ? "Admin" : "Usuario"}
                        </span>
                    </div>
                    <button onClick={logout} className="btn btn-sm btn-secondary btn-block">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to="/users" replace />} />
                    <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
                    <Route path="/users/new" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
                    <Route path="/users/:id/edit" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/users" replace />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppLayout />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
