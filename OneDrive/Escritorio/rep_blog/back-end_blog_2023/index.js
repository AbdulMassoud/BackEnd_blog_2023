const {conexion} = require("./database/conexion");
const express = require("express");
const cors = require("cors");

//Iniciar app
console.log("App de node arrancada");

//Conectar a la basse de datos
conexion();

//Crear servidor Node
const app = express();
const puerto = 3900;

//Configurar cors
app.use(cors());

//Convertir body a objeto js
app.use(express.json()); // Recibir datos con content-type app/json
app.use(express.urlencoded({extended:true})); // form-erlencoded

//Rutas
const rutas_articulo = require("./routes/articulos");

//Cargo las rutas
app.use("/api", rutas_articulo);

//Rutas prueba hardcodeadas
app.get("/probando", (req, res) => {

    console.log("Se ha ejecutado el endpoint probando");

    return res.status(200).send(`
        <div>
            <h1>Prubando ruta NODejs<h1>
            <h2>LAUTARO LAUTARO LAUTARO LAUTARO LAUTARO LAUTAROLAUTARO LAUTARO LAUTARO<h2>
            <h2>Di Maria<h2>
        </div>
    `);

});

//Crear servidor y escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor corriendo en el puerto "+puerto);
});