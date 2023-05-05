// Impotar modelo
const Song = require("../models/song");
const fs = require("fs");
const path = require("path");


// Accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/song.js"
    });
}

const save = (req, res) => {
    // Recoger los datos que me llegan por el body
    let params = req.body;

    // Crear un objeto con mi modelo
    let song = new Song(params);


    // Asignar los datos y guardar
    song.save((error, songStored) => {
        console.log(error);
        if (error || !songStored) {
            return res.status(500).send({
                status: "error",
                message: "La cancion no se ha guardado"

            });
        }
        // Devolver resultado
        return res.status(200).send({
            status: "success",
            song: songStored
        });
    });

}

const one = (req, res) => {
    let songId = req.params.id;

    Song.findById(songId).populate("album").exec((error, song) => {

        if (error || !song) {
            return res.status(404).send({
                status: "error",
                message: "La cancion no existe"
            });
        }

        return res.status(200).send({
            status: "success",
            song
        });

    });
}

const list = (req, res) => {
    // Recoger id de album
    let albumId = req.params.albumId;

    // Hacer consulta
    Song.find({ album: albumId })
        .populate({
            path: "album",
            populate: {
                path: "artist",
                model: "Artist"
            }


        })
        .sort("track").exec((error, songs) => {
            // DEvolver resultado
            if (error || !songs) {
                return res.status(404).send({
                    status: "error",
                    message: "No hay canciones"
                });
            }
            return res.status(200).send({
                status: "success",
                songs
            });

        });

}

const update = (req, res) => {

    // Parametro url id de cancion
    let songId = req.params.id;

    // Datos para guardar
    let data = req.body;

    // Busqueda y actualizacion
    Song.findByIdAndUpdate(songId, data, { new: true }, (error, songUpdated) => {

        if (error || !songUpdated) {                    
        return res.status(500).send({
            status: "error",
            message: "La cancion no se ha actualizado por",
            error
            
        });
        }

        return res.status(200).send({
            status: "success",
            song: songUpdated
        });


    });


}

const remove = (req, res) => {
    const songId = req.params.id;

    Song.findByIdAndRemove(songId, (error, songRemoved) => {

        if (error || !songRemoved) {
            return res.status(500).send({
                status: "error",
                message: "No se ha borrado la cancion" 
            });
        }

            return res.status(200).send({
                status: "success",
                songDeleted: songRemoved
            });


    });
}


const upload = (req, res) => {


    // Configuracion de subida (con multer)

    // Recoger artist id
    let songId = req.params.id;


    // Recoger fichero de song y comprobar si existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "La peticion no incluye la el archivo",
            file: req.file
        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar info de la imagen
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar di la extension es valida
    if (extension != "mp3" && extension != "ogg") {

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
    Song.findByIdAndUpdate({ _id: songId }, { file: req.file.filename }, { new: true }, (error, songUpdated) => {

        if (error || !songUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida de archivos",
                
            });
        }
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            song: songUpdated,
            file: req.file
        });
    });
}

    const audio = (req, res) => {
        // Sacar el parametro de la url
        const file = req.params.file;

        // Montar el path real de la imagen
        const filePath = "./uploads/songs/" + file;

        // Comprobar que existe el fichero
        fs.stat(filePath, (error, exists) => {

                if(error || !exists){
                    console.log(error);
                    return res.status(404).send({
                        status: "error",
                        message: "No existe la cancion"
                        
                    });
                }
                return res.sendFile(path.resolve(filePath));
        });

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
    audio
}