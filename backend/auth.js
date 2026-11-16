

import express from "express";
import {db} from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import {body} from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import {Strategy, ExtractJwt} from "passport-jwt";

const router = express.Router();

// configura la estrategia JWT de passport

export function authConfig(){
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    };

    passport.use(
        new Strategy(jwtOptions, async (payload, next) => {
            //token firmado okeysss -> el payloado pasa a req.user
            next(null, payload);
        }),
    );
}

//POST /auth/registrer

router.post(
    "/register",
    [
        body("nombre").isLength({ min: 1, max: 80}),
        body("email").isEmail(),
        body("password").isLength({ min: 8}),
    ],

    verificarValidaciones,
    async (req, res) => {
        const {nombre, email, password} = req.body;
        const hash = await bcrypt.hash(password, 12);


        try {
            const [result] = await db.execute(
                "INSERT INTO usuarios(nombre, email, password) VALUES(?, ?, ?)",
                [nombre, email, hash],
            );

            res.status(201).json({
                id: result.insertId,
                nombre,
                email,
            });

        } catch (e) {
            return res.status(400).json({
                mensaje: "No se pudo registrar el usuario"
            });
        }
    }
);


//POST /auth / login

router.post(

    "/login",
    [
        body("email").isEmail(),
        body("password").isLength({min:8}),
        
    ],

    verificarValidaciones,
    async (req, res) =>{
        const {email, password} = req.body;

        const [usuarios] = await db.execute(
            "SELECT * FROM usuarios WHERE email = ?",
            [email],
        );

        if (usuarios.length === 0){
            return res.status(400).json({
                mensaje: "usuario Invalido"
            });
        }
        const ok = await bcrypt.compare(password, usuarios[0].password);
        if (!ok){
            return res.status(400).json({mensaje: "Contraseña Invalida"});
        }

        const payload = {userId: usuarios[0].id};
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "4h",
        });

        res.json({
            token,
            nombre: usuarios[0].nombre,
            email: usuarios[0].email,
        });
    },
);

export default router;