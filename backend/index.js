import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import authRouter, { authConfig } from "./auth.js";
import vehiculosRouter from "./vehiculos.js";
import conductoresRouter from "./conductores.js";
import viajesRouter from "./viajes.js";

conectarDB();
authConfig(); // activa la estrategia JWT de Passport

const app = express();
const port = process.env.PORT || 3000;

// Interpreta el body JSON de los pedidos (ANTES de los routers)
app.use(express.json());

// Permite pedidos desde el frontend (otro origen/puerto)
app.use(cors());

app.get("/", (req, res) => {
  res.send("API TP3 transporte");
});

// Monta register y login bajo /auth
app.use("/auth", authRouter);

// Monta CRUD de vehiculos
app.use("/vehiculos", vehiculosRouter);

// Monta CRUD de conductores
app.use("/conductores", conductoresRouter);

// Monta CRUD de viajes
app.use("/viajes", viajesRouter);

// Errores no controlados -> 500 (enunciado pide status adecuados)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en ${port}`);
});
