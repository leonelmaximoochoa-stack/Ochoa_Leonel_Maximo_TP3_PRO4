import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

/**
 * Context guarda token + datos del usuario.
 * Asi cualquier pagina puede leer si hay sesion sin pasar props.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [usuario, setUsuario] = useState(() => {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  });

  async function login(email, password) {
    const { ok, data } = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (!ok) {
      throw new Error(data?.mensaje || "No se pudo iniciar sesion");
    }

    setToken(data.token);
    const u = { nombre: data.nombre, email: data.email };
    setUsuario(u);
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(u));
  }

  async function register(nombre, email, password) {
    const { ok, data } = await api("/auth/register", {
      method: "POST",
      body: { nombre, email, password },
    });

    if (!ok) {
      throw new Error(data?.mensaje || "No se pudo registrar");
    }

    // Despues del registro, login automatico
    await login(email, password);
  }

  function logout() {
    setToken("");
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }

  const value = useMemo(
    () => ({ token, usuario, login, register, logout, estaLogueado: Boolean(token) }),
    [token, usuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
