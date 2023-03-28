var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({ 
  email: { type: String, required: true },
  password: { type: String, required: true },  
  nom: { type: String, required: true },
  cognom: { type: String, required: true },
  dni: { type: String, required: false },
  especialitat: { type: String, required: false },
  grup: [{ type: Schema.ObjectId, ref: "Grup", required: false }],
  role: [{
    type: String,
    enum: [
      "professor","directiu","administrador"     
    ],
    default: "professor"
  }]
});

module.exports = mongoose.model('User', UserSchema);
