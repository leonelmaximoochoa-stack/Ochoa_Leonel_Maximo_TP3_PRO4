import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosVehiculos,
  validarVehiculo,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /vehiculos (lista + filtros opcionales)
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosVehiculos,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const valores = [];
    const { marca, anioMin } = req.query;

    if (marca) {
      filtros.push("marca LIKE ?");
      valores.push(`%${marca}%`);
    }

    if (anioMin !== undefined) {
      filtros.push("anio >= ?");
      valores.push(Number(anioMin));
    }

    let sql = "SELECT * FROM vehiculos";
    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    const [filas] = await db.execute(sql, valores);
    res.send(filas);
  },
);

// GET /vehiculos/:id/viajes — historial de viajes de ese vehiculo
router.get(
  "/:id/viajes",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [filas] = await db.execute(
      "SELECT * FROM viajes WHERE vehiculo_id = ? ORDER BY fecha_salida DESC",
      [id],
    );
    res.send(filas);
  },
);

// GET /vehiculos/:id/km — total de kilometros (SUM)
router.get(
  "/:id/km",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [filas] = await db.execute(
      "SELECT COALESCE(SUM(kilometros), 0) AS total_km FROM viajes WHERE vehiculo_id = ?",
      [id],
    );
    res.send({ vehiculo_id: id, total_km: filas[0].total_km });
  },
);

// GET /vehiculos/:id (detalle)
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [filas] = await db.execute("SELECT * FROM vehiculos WHERE id = ?", [
      id,
    ]);

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Vehiculo no encontrado" });
    }

    res.send(filas[0]);
  },
);

// POST /vehiculos (crear)
router.post(
  "/",
  validarAutenticacion,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const { marca, modelo, patente, anio, capacidad_carga } = req.body;

    try {
      const [result] = await db.execute(
        "INSERT INTO vehiculos(marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)",
        [marca, modelo, patente, anio, capacidad_carga],
      );

      res.status(201).send({
        id: result.insertId,
        marca,
        modelo,
        patente,
        anio,
        capacidad_carga,
      });
    } catch (e) {
      return res.status(400).json({ mensaje: "No se pudo crear el vehiculo" });
    }
  },
);

// PUT /vehiculos/:id (actualizar)
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarVehiculo,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { marca, modelo, patente, anio, capacidad_carga } = req.body;

    const [result] = await db.execute(
      "UPDATE vehiculos SET marca=?, modelo=?, patente=?, anio=?, capacidad_carga=? WHERE id=?",
      [marca, modelo, patente, anio, capacidad_carga, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Vehiculo no encontrado" });
    }

    res.send({ id, marca, modelo, patente, anio, capacidad_carga });
  },
);

// DELETE /vehiculos/:id
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [result] = await db.execute("DELETE FROM vehiculos WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Vehiculo no encontrado" });
    }

    res.status(204).send();
  },
);

export default router;
