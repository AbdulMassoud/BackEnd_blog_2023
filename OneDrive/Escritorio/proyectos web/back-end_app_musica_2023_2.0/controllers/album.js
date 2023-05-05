// Importaciones
const fs = require("fs");
const path = require("path");
const Album = require("../models/album");
const Song = require("../models/song");



// Accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde: controllers/album.js"
    });
}

const save = (req, res) => {

    // Sacar datos enviados en el body
    let params = req.body;
    // Crear objeto
    let album = new Album(params);

    // Guardar el objeto
    album.save((error, albumStored) => {

        if (error || !albumStored) {
            return res.status(500).send({
                status: "error",
                message: "Error al guardar el album",
                album: albumStored
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Metodo de guardar un album",
            album: albumStored
        });
    });
}

const one = (req, res) => {
    // sacar el id del album
    const albumId = req.params.id;

    // find y popular info del artista
    Album.findById(albumId).populate({ path: "artist" }).exec((error, album) => {
        // Album.findById(albumId).populate("artist").exec((error, album) => {             <--se puede hacer asi tambien sin los {path:}



        // Devolver una respuesta
        if (error || !album) {
            return res.status(404).send({
                status: "error",
                message: "No se ha encontrado al album"

            });
        }

        return res.status(200).send({
            status: "success",
            album
        });
    });

}

const list = (req, res) => {
    // sacar el id del artista de la url
    const artistId = req.params.artistId;

    // sacar todos los albums de la bbdd de un artista en concreto
    if (!artistId) {

        return res.status(404).send({
            status: "error",
            message: "No se ha encontrado el artista"


        });
    }

    // Find
    Album.find({ artist: artistId }).populate("artist").exec((error, albums) => {

        if (error || !albums) {
            console.log(error);
            return res.status(404).send({
                status: "error",
                message: "No se han encontrado albums"

            });
        }

        // devovler un resultado
        return res.status(200).send({
            status: "success",
            albums
        });

    });


}

const update = (req, res) => {
    // recoger param url
    const albumId = req.params.albumId;

    // recoger el body
    const data = req.body;

    // find y un update
    Album.findByIdAndUpdate(albumId, data, { new: true }, (error, albumUpdated) => {

        if (error || !albumUpdated) {
            return res.status(500).send({
                status: "error",
                message: 'No se ha actualizado el album'

            });
        }


        return res.status(200).send({
            status: "success",
            album: albumUpdated
        });
    });

}


const upload = (req, res) => {


    // Configuracion de subida (con multer)

    // Recoger artist id
    let albumId = req.params.id;


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

    // SI es correcto, guardar a album en la bbdd
    Album.findByIdAndUpdate({ _id: albumId }, { image: req.file.filename }, { new: true }, (error, albumUpdated) => {

        if (error || !albumUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida de archivos",
                file: req.file
            });
        }
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            artist: albumUpdated,
            file: req.file
        });
    });
}

    const image = (req, res) => {
        // Sacar el parametro de la url
        const file = req.params.file;

        // Montar el path real de la imagen
        const filePath = "./uploads/albums/" + file;

        // Comprobar que existe el fichero
        fs.stat(filePath, (error, exists) => {

                if(error || !exists){
                    console.log(error);
                    return res.status(404).send({
                        status: "error",
                        message: "No existe la imagen"
                        
                    });
                }
                return res.sendFile(path.resolve(filePath));
        });

    } 
    // Borrar album -> songs -------Devolver el fichero tal cual
    const remove = async (req, res) => {

        // Sacar el id del artista de la url
        const albumId = req.params.id;
    
        // Hacer consulta para buscra y eliminar el artista con un await
    
        try {
            const albumRemoved = await Album.findById(albumId);
            const songsRemoved = await Song.find({ album: albumId }).remove();
                
                
            
            // Y si hay muchso albums?????????????????????????????????????????????????????
            // Devolver resultado
            return res.status(200).send({
                status: "success",
                message: "Metodo borrado artista",
                albumRemoved,
                songsRemoved
                
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
    

// Exportar acciones
module.exports = {
    prueba,
    save,
    one,
    list,
    update,
    upload,
    image,
    remove
}