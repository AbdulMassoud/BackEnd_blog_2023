// Importar modulos
const fs = require("fs");
const path = require("path");

// Importar modelos
const Publication = require("../models/publication");

// Importar servicios
const followService = require("../services/followService");

// Acciones de prueba 
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js"
    });
}

// Guardar publicacion
const save = (req, res) => {
    // Recoger datos del body para guardarlos posteriomente
    const params = req.body;

    // Si no me llegan, dar una respuesta negativa
    if (!params.text) return res.status(400)({ status: "error", "message": "Debes enviar el texto de la publicacion." });

    // Crear y rellenar el objeto del modelo
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;

    // GUardar objeto e BBDD
    newPublication.save((error, publicationStored) => {

        if (error || !publicationStored) return res.status(400)({ status: "error", "message": "No se ha guardado la publicacion." });

        // Devolver respuesta
        return res.status(200).send({
            status: "seccess",
            message: "Publicacion guardada",
            publicationStored
        });
    });
}

// Sacar una publicacion en concreto
const detail = (req, res) => {
    // Sacar id de la publicacion de la url
    const publicationId = req.params.id;

    // Find con la condicion del id
    Publication.findById(publicationId, (error, publicationStored) => {

        if (error || !publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion"
            });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Mostrar publicacion",
            Publication: publicationStored
        });
    });


}

// Eliminar publicaciones
const remove = (req, res) => {
    // Sacar el id de la publicacion a eliminar
    const publicationId = req.params.id;

    // Find y remove
    Publication.find({ "user": req.user.id, "_id": publicationId }).remove(error => {
        if (error) {
            return res.status(500).send({
                status: "success",
                message: "No se ha publicacion",
            });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Borrar publicacion",
            publication: publicationId
        });
    });

}

// Listar publicaciones de un usuairo
const user = (req, res) => {
    // Sacar el id de usuario
    const userId = req.params.id;

    // Controlar la pagina
    let page = 1;

    if (req.params.page) page = req.params.apge

    const itemsPerPage = 5;

    // Find, populate, ordenar, paginar
    Publication.find({ "user": userId })
        .sort("-created_at")
        .populate('user', '-password -__v -role -email')
        .paginate(page, itemsPerPage, (error, publications, total) => {

            if (error || !publications || publications.length <= 0) {
                return res.status(404).send({
                    status: "error",
                    message: "No hay publicaciones para mostrar"
                });
            }




            //Devolver un resultado
            return res.status(200).send({
                status: "success",
                message: "Publicaciones del perfil de un usuario",
                page,
                total,
                pages: Math.ceil(total / itemsPerPage),
                publications
            });
        });

}


// Subir ficheros
const upload = (req, res) => {

    // Sacar publication id
    const publicationId = req.params.id;

    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Peticion no incluye la imagen"

        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    let imageSplit = image.split("\.");
    let extension = imageSplit[1];

    // Comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        // Borrar archivo subido
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);
        // Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "Extension del fichero invalida"
        });

    }



    // Si si es correcto, guardar imagen e bbdd
    Publication.findByIdAndUpdate({ "user": req.user.id, "_id": publicationId }, { file: req.file.filename }, { new: true }, (error, publicationUpdated) => {
        if (error || !publicationUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida del avatar"
            });
        }


        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            publication: publicationUpdated,
            file: req.file

        });
    });

}

// Devolver archivos multimedia

const media = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/publications/" + file;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            });
        }
        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    });

}

// Listar todas las publicaciones (FEED)
const feed = async (req, res) => {
    // Sacar la pagina actual
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    // Establecer numero de elementos por pagina
    let itemsPerPage = 5;

    // Sacar un array de identificadores de usuarios que yo sigo como usuario identificado
    try {
        const myFollows = await followService.followUserIds(req.user.id);

        // Find a publicaciones in, ordenar, popuilar, paginar
        const publications = await Publication.find({ user: myFollows.following })
            .populate("user", "-password -role -__v -email")
            .sort("-created_at")
            .paginate(page, itemsPerPage, (error, publications, total) => {


                if (error || !publications) {
                    return res.status(500).send({
                        status: "Error",
                        message: "Error, no hay publicaciones para mostrar",
            
                    });
                }



                return res.status(200).send({
                    status: "success",
                    message: "Feed de publicaciones",
                    following: myFollows.following,
                    total,
                    page,
                    pages: Math.ceil(total / itemsPerPage),
                    publications
                });
            });

       
    } catch (error) {
        return res.status(500).send({
            status: "Error",
            message: "No se han listado las publicacines del Feed de publicaciones",

        });
    }
}

// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}