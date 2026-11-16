import express from "express";
import { db } from "./db.js";
import {
  validarAutenticacion,
  validarFiltrosConductores,
  validarConductor,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

// GET /conductores (lista + filtros)
router.get(
  "/",
  validarAutenticacion,
  validarFiltrosConductores,
  verificarValidaciones,
  async (req, res) => {
    const filtros = [];
    const valores = [];
    const { apellido, documento } = req.query;

    if (apellido) {
      filtros.push("apellido LIKE ?");
      valores.push(`%${apellido}%`);
    }

    if (documento) {
      filtros.push("documento = ?");
      valores.push(documento);
    }

    let sql = "SELECT * FROM conductores";
    if (filtros.length > 0) {
      sql += " WHERE " + filtros.join(" AND ");
    }

    const [filas] = await db.execute(sql, valores);
    res.send(filas);
  },
);

// GET /conductores/:id/viajes — historial de viajes de ese conductor
router.get(
  "/:id/viajes",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [filas] = await db.execute(
      "SELECT * FROM viajes WHERE conductor_id = ? ORDER BY fecha_salida DESC",
      [id],
    );
    res.send(filas);
  },
);

// GET /conductores/:id/km — total de kilometros (SUM)
router.get(
  "/:id/km",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [filas] = await db.execute(
      "SELECT COALESCE(SUM(kilometros), 0) AS total_km FROM viajes WHERE conductor_id = ?",
      [id],
    );
    res.send({ conductor_id: id, total_km: filas[0].total_km });
  },
);

// GET /conductores/:id
router.get(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [filas] = await db.execute(
      "SELECT * FROM conductores WHERE id = ?",
      [id],
    );

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    res.send(filas[0]);
  },
);

// POST /conductores
router.post(
  "/",
  validarAutenticacion,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const {
      nombre,
      apellido,
      documento,
      numero_licencia,
      licencia_alta,
      licencia_vencimiento,
    } = req.body;

    try {
      const [result] = await db.execute(
        "INSERT INTO conductores(nombre, apellido, documento, numero_licencia, licencia_alta, licencia_vencimiento) VALUES (?, ?, ?, ?, ?, ?)",
        [
          nombre,
          apellido,
          documento,
          numero_licencia,
          licencia_alta,
          licencia_vencimiento,
        ],
      );

      res.status(201).send({
        id: result.insertId,
        nombre,
        apellido,
        documento,
        numero_licencia,
        licencia_alta,
        licencia_vencimiento,
      });
    } catch (e) {
      return res.status(400).json({ mensaje: "No se pudo crear el conductor" });
    }
  },
);

// PUT /conductores/:id
router.put(
  "/:id",
  validarAutenticacion,
  validarId,
  validarConductor,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const {
      nombre,
      apellido,
      documento,
      numero_licencia,
      licencia_alta,
      licencia_vencimiento,
    } = req.body;

    const [result] = await db.execute(
      "UPDATE conductores SET nombre=?, apellido=?, documento=?, numero_licencia=?, licencia_alta=?, licencia_vencimiento=? WHERE id=?",
      [
        nombre,
        apellido,
        documento,
        numero_licencia,
        licencia_alta,
        licencia_vencimiento,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    res.send({
      id,
      nombre,
      apellido,
      documento,
      numero_licencia,
      licencia_alta,
      licencia_vencimiento,
    });
  },
);

// DELETE /conductores/:id
router.delete(
  "/:id",
  validarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [result] = await db.execute(
      "DELETE FROM conductores WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Conductor no encontrado" });
    }

    res.status(204).send();
  },
);

export default router;