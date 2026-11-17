import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Vehiculos from "./pages/Vehiculos.jsx";
import Conductores from "./pages/Conductores.jsx";
import Viajes from "./pages/Viajes.jsx";

function RutaPrivada({ children }) {
  const { estaLogueado } = useAuth();
  // Sin token -> login (el backend tambien rechaza con 401)
  if (!estaLogueado) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { estaLogueado, usuario, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          TP3 Transporte
        </NavLink>
        <nav>
          <NavLink to="/">Inicio</NavLink>
          {estaLogueado && (
            <>
              <NavLink to="/vehiculos">Vehiculos</NavLink>
              <NavLink to="/conductores">Conductores</NavLink>
              <NavLink to="/viajes">Viajes</NavLink>
            </>
          )}
        </nav>
        <div className="topbar-right">
          {estaLogueado ? (
            <>
              <span className="muted">{usuario?.nombre}</span>
              <button type="button" className="btn secondary" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <NavLink className="btn" to="/login">
              Login
            </NavLink>
          )}
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/vehiculos"
            element={
              <RutaPrivada>
                <Vehiculos />
              </RutaPrivada>
            }
          />
          <Route
            path="/conductores"
            element={
              <RutaPrivada>
                <Conductores />
              </RutaPrivada>
            }
          />
          <Route
            path="/viajes"
            element={
              <RutaPrivada>
                <Viajes />
              </RutaPrivada>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
