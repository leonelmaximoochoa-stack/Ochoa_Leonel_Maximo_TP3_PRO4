import { body, param, query, validationResult } from "express-validator";
import passport from "passport";

// Middleware: exige JWT valido (Authorization: Bearer ...)
export const validarAutenticacion = passport.authenticate("jwt", {
  session: false,
});

// Si express-validator encontro errores -> 400
export const verificarValidaciones = (req, res, next) => {
  const resultado = validationResult(req);
  if (!resultado.isEmpty()) {
    return res.status(400).json({
      mensaje: "Parametros no validos",
      errores: resultado.array(),
    });
  }
  next();
};

//valida : id en la URL (params)

export const validarId = param("id").isInt({min: 1});

//Filtros opcionales del lsitado GET /vehiculos?...

export const validarFiltrosVehiculos = [
  query("marca").optional().isLength({min: 1, max: 50}),
  query("anioMin").optional().isInt({min: 1950, max: 2100}),
];

//body al crear/actualizar un vehiculo

export const validarVehiculo = [
  body("marca").isLength({min: 1 , max:50}),
  body("modelo").isLength({min: 1, max:50}),
  body("patente").isLength({min: 1, max:20}),
  body("anio").isInt({min:1950, max:2100}),
  body("capacidad_carga").isFloat({min: 0}),
];


//filtros Opcionales GET /conductores ?...

export const validarFiltrosConductores = [
  query("apellido").optional().isLength({min: 1, max: 50}),
  query("documento").optional().isLength({min: 1, max: 30}),
];

//body al crear/actualizar un conductor
export const validarConductor = [
  body("nombre").isLength({min : 1, max: 50}),
  body("apellido").isLength({min: 1, max: 50}),
  body("documento").isLength({min: 1, max: 30}),
  body("numero_licencia").isLength({min: 1, max: 40}),
  body("licencia_alta").isISO8601(),
  body("licencia_vencimiento").isISO8601(),
];

// Filtros opcionales GET /viajes?...
export const validarFiltrosViajes = [
  query("vehiculo_id").optional().isInt({ min: 1 }),
  query("conductor_id").optional().isInt({ min: 1 }),
  query("origen").optional().isLength({ min: 1, max: 100 }),
];

// Body al crear/actualizar un viaje
// vehiculo_id + conductor_id son FKs (relaciones con otras tablas)
export const validarViaje = [
  body("vehiculo_id").isInt({ min: 1 }),
  body("conductor_id").isInt({ min: 1 }),
  body("fecha_salida").isISO8601(),
  body("fecha_llegada").optional({ nullable: true }).isISO8601(),
  body("origen").isLength({ min: 1, max: 100 }),
  body("destino").isLength({ min: 1, max: 100 }),
  body("kilometros").isFloat({ min: 0 }),
  body("observaciones").optional({ nullable: true }).isLength({ max: 255 }),
];

