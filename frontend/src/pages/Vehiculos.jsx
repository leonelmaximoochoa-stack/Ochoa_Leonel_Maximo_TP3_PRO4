import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";

const vacio = {
  marca: "",
  modelo: "",
  patente: "",
  anio: "",
  capacidad_carga: "",
};

export default function Vehiculos() {
  const { token } = useAuth();
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [filtroMarca, setFiltroMarca] = useState("");
  const [error, setError] = useState("");
  const [kmPorId, setKmPorId] = useState({});

  async function cargar() {
    const q = filtroMarca ? `?marca=${encodeURIComponent(filtroMarca)}` : "";
    const { ok, data } = await api(`/vehiculos${q}`, { token });
    if (!ok) {
      setError(data?.mensaje || "Error al listar");
      return;
    }
    setLista(Array.isArray(data) ? data : [data].filter(Boolean));
  }

  useEffect(() => {
    cargar();
  }, [token]);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const body = {
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      patente: form.patente.trim(),
      anio: Number(form.anio),
      capacidad_carga: Number(form.capacidad_carga),
    };

    if (!body.marca || !body.modelo || !body.patente) {
      setError("Completa marca, modelo y patente");
      return;
    }

    const path = editId ? `/vehiculos/${editId}` : "/vehiculos";
    const method = editId ? "PUT" : "POST";
    const { ok, data } = await api(path, { method, body, token });

    if (!ok) {
      setError(data?.mensaje || "No se pudo guardar");
      return;
    }

    setForm(vacio);
    setEditId(null);
    await cargar();
  }

  function editar(v) {
    setEditId(v.id);
    setForm({
      marca: v.marca,
      modelo: v.modelo,
      patente: v.patente,
      anio: String(v.anio),
      capacidad_carga: String(v.capacidad_carga),
    });
  }

  async function eliminar(id) {
    if (!confirm("¿Borrar vehiculo?")) return;
    const { ok, data } = await api(`/vehiculos/${id}`, {
      method: "DELETE",
      token,
    });
    if (!ok) {
      setError(data?.mensaje || "No se pudo borrar");
      return;
    }
    await cargar();
  }

  async function verKm(id) {
    const { ok, data } = await api(`/vehiculos/${id}/km`, { token });
    if (ok) {
      setKmPorId((prev) => ({ ...prev, [id]: data.total_km }));
    }
  }

  return (
    <section className="panel">
      <h1>Vehiculos</h1>

      <div className="toolbar">
        <input
          placeholder="Filtrar por marca"
          value={filtroMarca}
          onChange={(e) => setFiltroMarca(e.target.value)}
        />
        <button type="button" className="btn secondary" onClick={cargar}>
          Buscar
        </button>
      </div>

      <form className="form grid" onSubmit={onSubmit}>
        <h2>{editId ? "Editar" : "Alta"}</h2>
        <label>
          Marca
          <input name="marca" value={form.marca} onChange={onChange} required />
        </label>
        <label>
          Modelo
          <input name="modelo" value={form.modelo} onChange={onChange} required />
        </label>
        <label>
          Patente
          <input name="patente" value={form.patente} onChange={onChange} required />
        </label>
        <label>
          Año
          <input
            name="anio"
            type="number"
            value={form.anio}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Capacidad carga
          <input
            name="capacidad_carga"
            type="number"
            step="0.01"
            value={form.capacidad_carga}
            onChange={onChange}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button className="btn" type="submit">
            {editId ? "Guardar cambios" : "Crear"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                setEditId(null);
                setForm(vacio);
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <table className="tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Patente</th>
            <th>Año</th>
            <th>Carga</th>
            <th>Km</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((v) => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.marca}</td>
              <td>{v.modelo}</td>
              <td>{v.patente}</td>
              <td>{v.anio}</td>
              <td>{v.capacidad_carga}</td>
              <td>
                {kmPorId[v.id] !== undefined ? kmPorId[v.id] : "—"}
                <button type="button" className="linkish" onClick={() => verKm(v.id)}>
                  ver
                </button>
              </td>
              <td className="row-actions">
                <Link to={`/viajes?vehiculo_id=${v.id}`}>historial</Link>
                <button type="button" onClick={() => editar(v)}>
                  editar
                </button>
                <button type="button" onClick={() => eliminar(v.id)}>
                  borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
