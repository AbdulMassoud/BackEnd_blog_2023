// Importaciones
const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const jwt = require("../helpers/jwt");


// Accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js",
        user: req.user
    });
}

// Registro
const register = (req, res) => {

    // Recoger lo datos de la peticion
    let params = req.body;
    console.log(params);

    // Comprobar que me lleguen bien
    if (!params.name || !params.nick || !params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            mesage: "Faltan datos por enviar"
        });
    }

    // Validar los datos
    try {
        validate(params);
    } catch (error) {
        return res.status(400).send({
            status: "error",
            mesage: "Validacion no superada"
        });
    }


    // Control usuarios duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {

        if (error) {
            return res.status(500).send({
                status: "error",
                mesage: "Error en la consulta de contorld e ususarios duplicados"
            });
        }

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "error",
                mesage: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Crear objeto del usuario
        let userToSave = new User(params);

        // Guardar usuario en la base de datos
        userToSave.save((error, userStored) => {

            if (error || !userStored) {
                return res.status(500).send({
                    status: "error",
                    mesage: "Error al registrar usuario"
                });
            }

            // Limpiar el objeto a devolver
            let userCreated = userStored.toObject();
            delete userCreated.password;
            delete userCreated.role;

            // Devovler un resultado
            return res.status(200).send({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userCreated
            });
        });

    })
}

const login = (req, res) => {

    // Recoger lo parametros de la peticion
    let params = req.body;


    // Comprobar que me llegan
    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar",

        });
    }

    // Buscar en la base de datos si existe el email
    User.findOne({ email: params.email })
        .select("+password +role")
        .exec((error, user) => {

            if (error || !user) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe el usuario",

                });
            }

            // Comprobar la contraseña 
            const pwd = bcrypt.compareSync(params.password, user.password);

            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    message: "Login incorrecto"


                });
            }

            //Limpiar objetos (borrar password y role)
            let identityUser = user.toObject();
            delete identityUser.password;
            delete identityUser.role;

            // Conseguir token jwt (crear un servicio que nos permita crear el token)
            const token = jwt.createToken(user)

            // Devolver datos usuario y token

            return res.status(200).send({
                status: "success",
                message: "Metodo de login",
                user: identityUser,
                token

            });
        });

}

const profile = (req, res) => {

    // Recoger id usuario url
    const id = req.params.id;

    // Consulta para sacar los datos del perfil 
    User.findById(id, (error, user) => {

        if (error || !user) {

            return res.status(404).send({
                status: "error",
                message: "El usuairo no existe"

            });
        }

        // Devolver resultado

        return res.status(200).send({
            status: "success",
            id,
            user

        });
    });


}

const update = (req, res) => {
    // Recoger datos usuario identificado
    let userIdentity = req.user;

    // Recoger datos a actualizar
    let userToUpdate = req.body;

    // Validar los datos
    try {
        validate(userToUpdate);
    } catch (error) {
        return res.status(400).send({
            status: "error",
            mesage: "Validacion no superada"
        });
    }

    // Comprobar si el usuario existe 
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {

        if (error) {
            return res.status(500).send({
                status: "error",
                message: "Error en la consulta de usuarios"
            });
        }

        // Comprobar si el usuario existe y no soy yo (el identificado)
        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        // SI ya existe devuelvo una respuesta
        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        // Cifrar password si me llegara
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        } else {
            delete userToUpdate.password;
        }

        // Buscar usuario en la bd y actualizar datos
        try {
            let userUpdated = await User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true });

            if (!userToUpdate) {
                return res.status(400).send({
                    status: "error",
                    message: "Error al actualizar 1"
                });
            }
            // Devolver respuesta
            return res.status(200).send({
                status: "success",
                message: "Metodo update datos usuario",
                user: userUpdated
            });

        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar 2"
            });
        }

    });


}

const upload = (req, res) => {


    // Configuracion de subida (con multer)


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
    User.findByIdAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true }, (error, userUpdated) => {

        if (error || !userUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida de archivos",
                file: req.file
            });
        }
        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            user: userUpdated,
            file: req.file
        });
    });
}

    const avatar = (req, res) => {
        // Sacar el parametro de la url
        const file = req.params.file;

        // Montar el path real de la imagen
        const filePath = "./uploads/avatars/" + file;

        // Comprobar que existe el fichero
        fs.stat(filePath, (error, exists) => {

                if(error || !exists){
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
    register,
    login,
    profile,
    update,
    upload,
    avatar
}