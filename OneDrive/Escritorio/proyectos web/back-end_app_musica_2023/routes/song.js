// Importar dpendencias
const express = require("express");


// Cargas Router
const router = express.Router();

// Importar controlador
const SongController = require("../controllers/song");

// Definir rutas
router.get("/prueba", SongController.prueba);

// Exportar router
module.exports = router;