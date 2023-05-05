// Accion de prueba
const prueba = (req, res) => {
    return res. status(200).send({
        status: "success",
        message: "Mensaje enviado desde: controller/song.js"

    });
}

// Exportar acciones
module.exports = {
    prueba
}