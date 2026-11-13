import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";

conectarDB();

const app = express();
const port = process.env.PORT || 3000;

//interpreta el body JSon de los pedidos

app.use(express.json());

//permite pedidos desde el frontend (otro origen/puerto)
app.use(cors());

app.get("/", (req, res ) => {
    res.send("API TP3 transporte");
});

app.listen(port, () => {
    console.log(`La aplicacion esta funcionando en ${port}`);
});