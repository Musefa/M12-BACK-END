var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var Schema = mongoose.Schema;

var ActaSchema = new Schema({
    estat: {
      type: String,
      enum: [
        "Oberta","Tancada"     
      ],
      default: "Oberta"
    },
    nom: { type: String, required: true },
    descripcions: [{ type: String, required: true }],
    convocatoria: { type: Schema.ObjectId, ref: "Convocatoria" },
    acords: [{ type: Schema.ObjectId, ref: "Acord", required: false }],
    creador: { type: Schema.ObjectId, ref: "User", required: false }
  });
  
  ActaSchema.plugin(mongoosePaginate);
  // Export model.
  module.exports = mongoose.model("Acta", ActaSchema);