const mongoose = require("mongoose");

const connection = async() => {

    try {
        
        mongoose.set('strictQuery', true);
        await mongoose.connect("mongodb://127.0.0.1:27017/back-end_red_social_2023", {useNewUrlParser: true});

              

        console.log("Conectado correctamente a la base de datos: red_social_2023");

    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar la base de datos !!");
    }

}

module.exports = connection