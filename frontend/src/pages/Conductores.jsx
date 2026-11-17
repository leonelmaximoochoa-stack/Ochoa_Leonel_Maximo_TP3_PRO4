import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";

const vacio = {
  nombre: "",
  apellido: "",
  documento: "",
  numero_licencia: "",
  licencia_alta: "",
  licencia_vencimiento: "",
};

export default function Conductores() {
  const { token } = useAuth();
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [filtroApellido, setFiltroApellido] = useState("");
  const [error, setError] = useState("");
  const [kmPorId, setKmPorId] = useState({});

  async function cargar() {
    const q = filtroApellido
      ? `?apellido=${encodeURIComponent(filtroApellido)}`
      : "";
    const { ok, data } = await api(`/conductores${q}`, { token });
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

  function fechaInput(valor) {
    if (!valor) return "";
    return String(valor).slice(0, 10);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const body = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      documento: form.documento.trim(),
      numero_licencia: form.numero_licencia.trim(),
      licencia_alta: form.licencia_alta,
      licencia_vencimiento: form.licencia_vencimiento,
    };

    if (!body.nombre || !body.apellido || !body.documento) {
      setError("Completa nombre, apellido y documento");
      return;
    }

    const path = editId ? `/conductores/${editId}` : "/conductores";
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

  function editar(c) {
    setEditId(c.id);
    setForm({
      nombre: c.nombre,
      apellido: c.apellido,
      documento: c.documento,
      numero_licencia: c.numero_licencia,
      licencia_alta: fechaInput(c.licencia_alta),
      licencia_vencimiento: fechaInput(c.licencia_vencimiento),
    });
  }

  async function eliminar(id) {
    if (!confirm("¿Borrar conductor?")) return;
    const { ok, data } = await api(`/conductores/${id}`, {
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
    const { ok, data } = await api(`/conductores/${id}/km`, { token });
    if (ok) {
      setKmPorId((prev) => ({ ...prev, [id]: data.total_km }));
    }
  }

  return (
    <section className="panel">
      <h1>Conductores</h1>

      <div className="toolbar">
        <input
          placeholder="Filtrar por apellido"
          value={filtroApellido}
          onChange={(e) => setFiltroApellido(e.target.value)}
        />
        <button type="button" className="btn secondary" onClick={cargar}>
          Buscar
        </button>
      </div>

      <form className="form grid" onSubmit={onSubmit}>
        <h2>{editId ? "Editar" : "Alta"}</h2>
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={onChange} required />
        </label>
        <label>
          Apellido
          <input name="apellido" value={form.apellido} onChange={onChange} required />
        </label>
        <label>
          Documento
          <input
            name="documento"
            value={form.documento}
            onChange={onChange}
            required
          />
        </label>
        <label>
          N° licencia
          <input
            name="numero_licencia"
            value={form.numero_licencia}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Licencia alta
          <input
            type="date"
            name="licencia_alta"
            value={form.licencia_alta}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Licencia vencimiento
          <input
            type="date"
            name="licencia_vencimiento"
            value={form.licencia_vencimiento}
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
            <th>Nombre</th>
            <th>Documento</th>
            <th>Licencia</th>
            <th>Vence</th>
            <th>Km</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>
                {c.nombre} {c.apellido}
              </td>
              <td>{c.documento}</td>
              <td>{c.numero_licencia}</td>
              <td>{fechaInput(c.licencia_vencimiento)}</td>
              <td>
                {kmPorId[c.id] !== undefined ? kmPorId[c.id] : "—"}
                <button type="button" className="linkish" onClick={() => verKm(c.id)}>
                  ver
                </button>
              </td>
              <td className="row-actions">
                <Link to={`/viajes?conductor_id=${c.id}`}>historial</Link>
                <button type="button" onClick={() => editar(c)}>
                  editar
                </button>
                <button type="button" onClick={() => eliminar(c.id)}>
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
