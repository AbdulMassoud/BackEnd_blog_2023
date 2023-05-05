// Importar mongoose
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

// Metodo de conexion
const connection = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/ap_music");

        console.log("Conectado correctamente a la bd: app_musica");


    }catch(error){
        console.log(error);
        throw new Error("No se ha establecido la conexion a la bbdd !!");
    }
}

// Exportar conexion 
module.exports = connection;