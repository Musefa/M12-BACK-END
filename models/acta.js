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
    descripcions: [{ type: String, required: true }],
    convocatoria: { type: Schema.ObjectId, ref: "Convocatoria" },
    acords: [{ type: Schema.ObjectId, ref: "Acord", required: false }]
  });
  
  ActaSchema.plugin(mongoosePaginate);
  // Export model.
  module.exports = mongoose.model("Acta", ActaSchema);