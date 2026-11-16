import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosViajes,
  validarViaje,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// JOIN: trae datos del vehiculo y conductor (no solo los ids)
const SELECT_VIAJES = `
  SELECT
    v.id,
    v.vehiculo_id,
    v.conductor_id,
    v.fecha_salida,
    v.fecha_llegada,
    v.origen,
    v.destino,
    v.kilometros,
    v.observaciones,
    ve.patente AS vehiculo_patente,
    ve.marca AS vehiculo_marca,
    CONCAT(c.nombre, ' ', c.apellido) AS conductor_nombre
  FROM viajes v
  INNER JOIN vehiculos ve ON ve.id = v.vehiculo_id
  INNER JOIN conductores c ON c.id = v.conductor_id
`;

// GET /viajes (lista + filtros query)
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosViajes,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const valores = [];
    const { vehiculo_id, conductor_id, origen } = req.query;

    if (vehiculo_id !== undefined) {
      filtros.push("v.vehiculo_id = ?");
      valores.push(Number(vehiculo_id));
    }

    if (conductor_id !== undefined) {
      filtros.push("v.conductor_id = ?");
      valores.push(Number(conductor_id));
    }

    if (origen) {
      filtros.push("v.origen LIKE ?");
      valores.push(`%${origen}%`);
    }

    let sql = SELECT_VIAJES;
    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }
    sql += " ORDER BY v.fecha_salida DESC";

    const [filas] = await db.execute(sql, valores);
    res.send(filas);
  },
);

// GET /viajes/:id
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [filas] = await db.execute(SELECT_VIAJES + " WHERE v.id = ?", [id]);

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    res.send(filas[0]);
  },
);

// POST /viajes (alta: asocia vehiculo + conductor)
router.post(
  "/",
  validarAutenticacion,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const {
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones,
    } = req.body;

    try {
      const [result] = await db.execute(
        `INSERT INTO viajes
        (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vehiculo_id,
          conductor_id,
          fecha_salida,
          fecha_llegada ?? null,
          origen,
          destino,
          kilometros,
          observaciones ?? null,
        ],
      );

      res.status(201).send({
        id: result.insertId,
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada: fecha_llegada ?? null,
        origen,
        destino,
        kilometros,
        observaciones: observaciones ?? null,
      });
    } catch (e) {
      // FK rota (vehiculo/conductor inexistente) u otro error SQL -> 400
      return res.status(400).json({ mensaje: "No se pudo crear el viaje" });
    }
  },
);

// PUT /viajes/:id
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarViaje,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const {
      vehiculo_id,
      conductor_id,
      fecha_salida,
      fecha_llegada,
      origen,
      destino,
      kilometros,
      observaciones,
    } = req.body;

    try {
      const [result] = await db.execute(
        `UPDATE viajes SET
          vehiculo_id=?, conductor_id=?, fecha_salida=?, fecha_llegada=?,
          origen=?, destino=?, kilometros=?, observaciones=?
         WHERE id=?`,
        [
          vehiculo_id,
          conductor_id,
          fecha_salida,
          fecha_llegada ?? null,
          origen,
          destino,
          kilometros,
          observaciones ?? null,
          id,
        ],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: "Viaje no encontrado" });
      }

      res.send({
        id,
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada: fecha_llegada ?? null,
        origen,
        destino,
        kilometros,
        observaciones: observaciones ?? null,
      });
    } catch (e) {
      return res.status(400).json({ mensaje: "No se pudo actualizar el viaje" });
    }
  },
);

// DELETE /viajes/:id
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [result] = await db.execute("DELETE FROM viajes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }

    res.status(204).send();
  },
);

export default router;
