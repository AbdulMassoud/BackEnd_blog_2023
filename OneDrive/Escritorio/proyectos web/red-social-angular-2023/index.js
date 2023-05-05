// Importar dependencias
const connection = require("./database/connection");
const express = require("express");



//Mensaje de bienvenida
console.log("API NODE para RED SOCIAL arrancada !!");


// Conexion a la base de datos 
connection();

// Crear servidor node
const app = express();
const puerto = 3912;





// Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("servidor de node corriendo en el puerto: ", puerto);
});

