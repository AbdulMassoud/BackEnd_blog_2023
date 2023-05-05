// Importaciones
const Artist = require("../models/artist");
const Album = require("../models/album");
const Song = require("../models/song");
const check = require("../middlewares/auth");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");


// Accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/artist.js"
    });
}

// Accion guardar artista
const save = (req, res) => {
    // Recoger datos del body
    let params = req.body;

    // Crear el objeto a guardar
    let artist = new Artist(params);

    // Guardarlo
    artist.save((error, artistStored) => {
        if (error || !artistStored) {
            return res.status(400).send({
                status: "errror",
                message: "No se ha guardado el artista"

            });
        }

        return res.status(200).send({
            status: "success",
            artist: artistStored
        });
    });


}

const one = (req, res) => {
    // Sacar un parametro por url
    const artistId = req.params.id;

    // Find
    Artist.findById(artistId, (error, artist) => {
        if (error || !artist) {
            return res.status(404).send({
                status: "error",
                message: "No existe el artista"
            });
        }

        return res.status(200).send({
            status: "success",
            artist
        });
    });
}

const list = (req, res) => {

    // Sacar laposible pagina
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    // Definir numero de elementos por pagina
    const itemsPerPage = 5;

    // Find, ordenarlo y paginarlo
    Artist.find()
        .sort("name")
        .paginate(page, itemsPerPage, (error, artists, total) => {

            if (error || !artists) {
                return res.status(404).send({
                    status: "error",
                    message: "No hay artistas"
                });
            }

            return res.status(200).send({
                status: "success",
                page,
                itemsPerPage,
                total,
                artists
            });
        });



}

const update = (req, res) => {
    // Recoger id artista url
    const id = req.params.id;

    // Recoger datos body
    const data = req.body;

    // Buscar y actualizar artista
    Artist.findByIdAndUpdate(id, data, { new: true }, (error, artistUpdated) => {

        if (error || !artistUpdated) {
            return res.status(500).send({
                status: "error",
                message: "No se ha actualizado el artista"
            });
        }

        return res.status(200).send({
            status: "success",
            artist: artistUpdated
        });
    });

}

const remove = async (req, res) => {

    // Sacar el id del artista de la url
    const artistId = req.params.id;

    // Hacer consulta para buscra y eliminar el artista con un await

    try {
        const artistRemoved = await Artist.findByIdAndDelete(artistId);
        const albumRemoved = await Album.find({ artist: artistId });

        
        albumRemoved.forEach(async (album) => {            
            const songsRemoved = await Song.find({ album: album._id }).remove();
            
            album.remove();
            
        });
        // Y si hay muchso albums?????????????????????????????????????????????????????
        // Devolver resultado
        return res.status(200).send({
            status: "success",
            message: "Metodo borrado artista",
            
        });


    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar el artista o algunos de sus elementos",
            error
        });
    }
}

const upload = (req, res) => {


    // Configuracion de subida (con multer)

    // Recoger artist id
    let artistId = req.params.id;


    // Recoger fichero de imagen y comprobar si existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "La peticion no incluye la imagen",
            file: req.file
        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar info de la imagen
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar di la extension es valida
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        // Borrar archivo
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        // Devolver error
        return res.status(404).send({
            status: "error",
            message: "La extension no es valida",
            file: req.file
        });


    }

    // SI es correcto, guardar a imagen en la bbdd
    Artist.findByIdAndUpdate({ _id: artistId }, { image: req.file.filename }, { new: true }, (error, artistUpdated) => {

        if (error || !artistUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida de archivos",
                file: req.file
            });
        }
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            artist: artistUpdated,
            file: req.file
        });
    });
}

const image = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/artists/" + file;

    // Comprobar que existe el fichero
    fs.stat(filePath, (error, exists) => {

        if (error || !exists) {
            console.log(error);
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"

            });
        }
        return res.sendFile(path.resolve(filePath));
    });

    // Devolver el fichero tal cual
}


// Exportar acciones
module.exports = {
    prueba,
    save,
    one,
    list,
    update,
    remove,
    upload,
    image
}