import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Home() {
  const { estaLogueado, usuario } = useAuth();

  return (
    <section className="panel">
      <h1>TP3 Transporte</h1>
      <p className="muted">
        Gestion de vehiculos, conductores y viajes. API REST + JWT.
      </p>

      {estaLogueado ? (
        <p>
          Hola, <strong>{usuario?.nombre}</strong>. Ya podes administrar datos.
        </p>
      ) : (
        <p>Inicia sesion para usar el sistema (las rutas CRUD estan protegidas).</p>
      )}

      <div className="actions">
        {!estaLogueado && (
          <Link className="btn" to="/login">
            Iniciar sesion
          </Link>
        )}
        {estaLogueado && (
          <>
            <Link className="btn" to="/vehiculos">
              Vehiculos
            </Link>
            <Link className="btn" to="/conductores">
              Conductores
            </Link>
            <Link className="btn" to="/viajes">
              Viajes
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
