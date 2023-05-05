const mongoose = require("mongoose");

const conexion = async() => {

    try {
        
       mongoose.set('strictQuery', true); 
       mongoose.connect("mongodb://127.0.0.1:27017/mi_blog", { useNewUrlParser: true})

       //Parametros dentro de objeto // solo en caso de aviso
       // useNewUrlParser: true
       // useUnifiedTopology: true
       // useCreateIndex: true

       console.log("La conexion a la base de datos ha sido exitosa!");

    } catch (error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos...");
    }

}
module.exports = {
    conexion
}