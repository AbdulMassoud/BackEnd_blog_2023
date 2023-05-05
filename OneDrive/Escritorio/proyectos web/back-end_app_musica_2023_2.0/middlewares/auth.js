// Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

// IMportar clave secreta
const { secret } = require("../helpers/jwt");

// Crear middlewares (metodo o funcion)
exports.auth = (req, res, next) => {

    // Comprobar si me llega la cabecera de autenticacion
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticacion"
        });
    }

    // Limpiar token
    let token = req.headers.authorization.replace(/['"]+/g, "");

    try {
        // Decodificar el token
        let payload = jwt.decode(token, secret);

        // Vomprobar la expiracion del token
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "Token expirado"
                
            });
        }

        // Agregar datos del usuario a la request
        req.user = payload;


    } catch (error){
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            error
        });
    }

    // Pasar a la ejecucion de la accion
    next();
};
