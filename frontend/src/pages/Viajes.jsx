import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";

const vacio = {
  vehiculo_id: "",
  conductor_id: "",
  fecha_salida: "",
  fecha_llegada: "",
  origen: "",
  destino: "",
  kilometros: "",
  observaciones: "",
};

export default function Viajes() {
  const { token } = useAuth();
  const [params] = useSearchParams();
  const [lista, setLista] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [titulo, setTitulo] = useState("Viajes");

  async function cargarListas() {
    const [v, c] = await Promise.all([
      api("/vehiculos", { token }),
      api("/conductores", { token }),
    ]);
    if (v.ok) setVehiculos(Array.isArray(v.data) ? v.data : []);
    if (c.ok) setConductores(Array.isArray(c.data) ? c.data : []);
  }

  async function cargarViajes() {
    const vehiculoId = params.get("vehiculo_id");
    const conductorId = params.get("conductor_id");

    let path = "/viajes";
    if (vehiculoId) {
      path = `/vehiculos/${vehiculoId}/viajes`;
      setTitulo(`Historial vehiculo #${vehiculoId}`);
    } else if (conductorId) {
      path = `/conductores/${conductorId}/viajes`;
      setTitulo(`Historial conductor #${conductorId}`);
    } else {
      setTitulo("Viajes");
    }

    const { ok, data } = await api(path, { token });
    if (!ok) {
      setError(data?.mensaje || "Error al listar viajes");
      return;
    }
    setLista(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    cargarListas();
    cargarViajes();
  }, [token, params]);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function aDatetimeLocal(valor) {
    if (!valor) return "";
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return String(valor).slice(0, 16);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const body = {
      vehiculo_id: Number(form.vehiculo_id),
      conductor_id: Number(form.conductor_id),
      fecha_salida: form.fecha_salida,
      fecha_llegada: form.fecha_llegada || null,
      origen: form.origen.trim(),
      destino: form.destino.trim(),
      kilometros: Number(form.kilometros),
      observaciones: form.observaciones.trim() || null,
    };

    if (!body.origen || !body.destino || !body.vehiculo_id || !body.conductor_id) {
      setError("Completa vehiculo, conductor, origen y destino");
      return;
    }

    const path = editId ? `/viajes/${editId}` : "/viajes";
    const method = editId ? "PUT" : "POST";
    const { ok, data } = await api(path, { method, body, token });

    if (!ok) {
      setError(data?.mensaje || "No se pudo guardar el viaje");
      return;
    }

    setForm(vacio);
    setEditId(null);
    await cargarViajes();
  }

  function editar(v) {
    setEditId(v.id);
    setForm({
      vehiculo_id: String(v.vehiculo_id),
      conductor_id: String(v.conductor_id),
      fecha_salida: aDatetimeLocal(v.fecha_salida),
      fecha_llegada: aDatetimeLocal(v.fecha_llegada),
      origen: v.origen,
      destino: v.destino,
      kilometros: String(v.kilometros),
      observaciones: v.observaciones || "",
    });
  }

  async function eliminar(id) {
    if (!confirm("¿Borrar viaje?")) return;
    const { ok, data } = await api(`/viajes/${id}`, { method: "DELETE", token });
    if (!ok) {
      setError(data?.mensaje || "No se pudo borrar");
      return;
    }
    await cargarViajes();
  }

  return (
    <section className="panel">
      <h1>{titulo}</h1>

      <form className="form grid" onSubmit={onSubmit}>
        <h2>{editId ? "Editar viaje" : "Registrar viaje"}</h2>
        <label>
          Vehiculo
          <select
            name="vehiculo_id"
            value={form.vehiculo_id}
            onChange={onChange}
            required
          >
            <option value="">Elegir...</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                #{v.id} {v.marca} {v.modelo} ({v.patente})
              </option>
            ))}
          </select>
        </label>
        <label>
          Conductor
          <select
            name="conductor_id"
            value={form.conductor_id}
            onChange={onChange}
            required
          >
            <option value="">Elegir...</option>
            {conductores.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.id} {c.nombre} {c.apellido}
              </option>
            ))}
          </select>
        </label>
        <label>
          Salida
          <input
            type="datetime-local"
            name="fecha_salida"
            value={form.fecha_salida}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Llegada
          <input
            type="datetime-local"
            name="fecha_llegada"
            value={form.fecha_llegada}
            onChange={onChange}
          />
        </label>
        <label>
          Origen
          <input name="origen" value={form.origen} onChange={onChange} required />
        </label>
        <label>
          Destino
          <input name="destino" value={form.destino} onChange={onChange} required />
        </label>
        <label>
          Kilometros
          <input
            type="number"
            step="0.01"
            name="kilometros"
            value={form.kilometros}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Observaciones
          <input
            name="observaciones"
            value={form.observaciones}
            onChange={onChange}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button className="btn" type="submit">
            {editId ? "Guardar" : "Crear viaje"}
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
            <th>Vehiculo</th>
            <th>Conductor</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Km</th>
            <th>Salida</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((v) => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.vehiculo_patente || v.vehiculo_id}</td>
              <td>{v.conductor_nombre || v.conductor_id}</td>
              <td>{v.origen}</td>
              <td>{v.destino}</td>
              <td>{v.kilometros}</td>
              <td>{aDatetimeLocal(v.fecha_salida).replace("T", " ")}</td>
              <td className="row-actions">
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
