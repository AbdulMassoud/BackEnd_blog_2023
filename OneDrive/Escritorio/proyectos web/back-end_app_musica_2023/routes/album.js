// Importar dpendencias
const express = require("express");


// Cargas Router
const router = express.Router();

// Importar controlador
const AlbumController = require("../controllers/album");

// Definir rutas
router.get("/prueba", AlbumController.prueba);

// Exportar router
module.exports = router;