// Importar dpendencias
const express = require("express");


// Cargas Router
const router = express.Router();

// Importar controlador
const ArtistController = require("../controllers/artist");

// Definir rutas
router.get("/prueba", ArtistController.prueba);

// Exportar router
module.exports = router;