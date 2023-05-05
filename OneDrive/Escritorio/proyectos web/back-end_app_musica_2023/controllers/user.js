// Importaciones
const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const User = require("../models/user");
const jwt = require("../helpers/jwt");



// Accion de prueba
const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde: controller/user.js",
        user: req.user

    });
}

// Registro
const register = (req, res) => {

    // Recoger datos de la peticion
    let params = req.body;

    // Comprobar que me llegan bien
    if (!params.name || !params.nick || !params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    // Validar los datos
    try {
        validate(params);

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "Validacion no superada  ---En Controllers---"
        });
    }

    // Control de usuarios duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {


        if (error) {

            return res.status(500).send({
                status: "error",
                message: "Error en la consulta de control de usuarios duplicados"
            });
        }

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "error",
                message: "El usuario ya existe"
            });

        }

        // Cifrar contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Crear objeto del usuario
        let userToSave = new User(params);

        // Guardar usuario en la bd
        userToSave.save((error, userStored) => {

            if (error || !userStored) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al registrar usuario"
                });
            }

            // Limpiar el objeto a devolver
            let userCreated = userStored.toObject();
            delete userCreated.password;
            delete userCreated.role;

            // Devolver un resutado      
            return res.status(200).send({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userCreated
            });
        });

    });
}


const login = (req, res) => {


    // Recoger los parametros de la peticion
    let params = req.body;

    // Comprobar que me llegan
    if (!params.email || !params.password) {

        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    // Buscar en la bd si existe el email
    User.findOne({ email: params.email })
        .select("+password +role")           // => esto es para traer objetos que fueron restringidos anteriormente como por ejemplo la password <=
        .exec((error, user) => {

            if (error || !user) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe el usuario"
                });
            }

            // Comprobar su contraseña
            const pwd = bcrypt.compareSync(params.password, user.password);



            if (!pwd) {
                return res.status(404).send({
                    status: "error",
                    message: "Login incorrecto"
                });
            }


            // Limpiar objetos ( esto es para borrar la propiedad contraseña del objeto usuario que se devuelve en la consulta)
            let indentityUser = user.toObject();
            delete indentityUser.password;
            delete indentityUser.role;

            // Conseguir token jwt (crear un servicio que nos permita crear el token)
            const token = jwt.createToken(user);




            // Devolver datos usuarios y token
            return res.status(200).send({
                status: "success",
                message: "Metodo de login",
                message: "Bienvenido",
                user: indentityUser,
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
                message: "El usuario no existe"
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
    const userIdentity = req.user;
    

    // Recoger datos a actualizar
    const userToUpdate = req.body;

    
    // Validar los datos
    try {
        validate(userToUpdate);

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            status: "error",
            message: "Validacion no superada  ---En el validate---"
        });
    }

   // console.log(userIdentity, userToUpdate)

    // Comprobar si el usuario existe
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() },
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

        // Si ya existe devuelvo una respuesta
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

        // Buscar usuario en la db y actualizar datos
        try {
            let userUpdated = await User.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, { new: true });
            

            if(!userUpdated){
                return res.status(400).send({
                    status: "error",
                    message: "No llego user updated"
                });
            }

            // Devolver una respuesta
            return res.status(200).send({
                status: "success",
                user: userUpdated
            });

        } catch (error) {
            console.log(error);
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar (catch)"
                
            });  
        } 

    });

}





// Exportar acciones
module.exports = {
    prueba,
    register,
    login,
    profile,
    update
}