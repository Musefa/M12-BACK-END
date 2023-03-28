var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var Schema = mongoose.Schema;

var GrupSchema = new Schema({
    nom: { type: String, required: true },
    tipus: { type: String, required: true, 
      enum: [
      "Públic","Privat"     
    ],
    default: "Privat" },
    membres: [{ type: Schema.ObjectId, ref: "User" }]
    //usamos el nombre de la posición/objeto del esquema para listar el contenido en la view
    //usaremos membres para las funciones del controller
  });
  
  GrupSchema.plugin(mongoosePaginate);
  // Export model.
  module.exports = mongoose.model("Grup", GrupSchema);