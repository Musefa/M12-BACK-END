var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var Schema = mongoose.Schema;

var AcordSchema = new Schema({
    dataInici: { type: Date, required: true },
    dataFinal: { type: Date, required: true },
    descripcio: { type: String, required: true },
    acta: { type: Schema.ObjectId, ref: "Acta", required: false }
  });
  
  AcordSchema.plugin(mongoosePaginate);
  // Export model.
  module.exports = mongoose.model("Acord", AcordSchema);