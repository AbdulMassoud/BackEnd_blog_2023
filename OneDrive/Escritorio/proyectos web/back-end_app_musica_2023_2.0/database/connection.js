// Importar mongoose
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);


// Metodo de conexion
const connection = async() => {
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/app_music_2");

        console.log("Conectado corresctamente a la bd: app_music_2");
    }catch(error){
        console.log(error);
        throw new Error("No se ha establecido la conexion a la bbdd !!");
    }
}


// Exportar conexion
module.exports = connection;