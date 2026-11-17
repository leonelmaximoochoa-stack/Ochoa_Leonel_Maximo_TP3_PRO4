import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Validacion basica en frontend (ademas de la del backend)
    if (!email.includes("@")) {
      setError("Email invalido");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (modo === "register" && nombre.trim().length < 1) {
      setError("Nombre obligatorio");
      return;
    }

    try {
      if (modo === "login") {
        await login(email, password);
      } else {
        await register(nombre.trim(), email, password);
      }
      navigate("/vehiculos");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel narrow">
      <h1>{modo === "login" ? "Iniciar sesion" : "Registrarse"}</h1>
      <form onSubmit={onSubmit} className="form">
        {modo === "register" && (
          <label>
            Nombre
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">
          {modo === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>
      <button
        type="button"
        className="linkish"
        onClick={() => setModo(modo === "login" ? "register" : "login")}
      >
        {modo === "login"
          ? "¿No tenes cuenta? Registrate"
          : "¿Ya tenes cuenta? Inicia sesion"}
      </button>
    </section>
  );
}
