// Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");


// Clave secreta
const secret = "CLAVE_SECRETA-DE-MI-APP-MUSICAL789456123";


// Crear funcion para generar rokens
const createToken = (user) => {

    const payload = {
        id:user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp:moment().add(30, "days").unix()
    };

    // Devolver token
    return jwt.encode(payload, secret);


}


// Exportar modulo
module.exports ={
    secret,
    createToken
}