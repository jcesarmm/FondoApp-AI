import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthUser {
    userId: string;
    email: string;
    isAdmin: boolean;
}

interface AuthContextType {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): AuthUser | null {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return {
            userId: decoded.userId,
            email: decoded.email,
            isAdmin: decoded.isAdmin,
        };
    } catch {
        return null;
    }
}

function isTokenExpired(token: string): boolean {
    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => {
        const stored = localStorage.getItem("auth_token");
        if (stored && !isTokenExpired(stored)) return stored;
        localStorage.removeItem("auth_token");
        return null;
    });

    const [user, setUser] = useState<AuthUser | null>(() => {
        const stored = localStorage.getItem("auth_token");
        if (stored && !isTokenExpired(stored)) return decodeToken(stored);
        return null;
    });

    const login = (newToken: string) => {
        localStorage.setItem("auth_token", newToken);
        setToken(newToken);
        setUser(decodeToken(newToken));
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
    };

    // Check token expiry periodically
    useEffect(() => {
        if (!token) return;
        const interval = setInterval(() => {
            if (isTokenExpired(token)) {
                logout();
            }
        }, 60_000);
        return () => clearInterval(interval);
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
