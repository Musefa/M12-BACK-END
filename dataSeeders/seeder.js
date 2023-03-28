require('dotenv').config({path: '.env'})
var bcrypt = require('bcrypt');

// Importar models
var mongoose = require('mongoose');

var Grup = require("../models/grup");
var Plantilla = require("../models/plantilla");
var User = require("../models/user");
var Convocatoria = require("../models/convocatoria");
var Acta = require("../models/acta");
var Acord = require("../models/acord");

// Carregar dades de fitxers JSON
var grupsJSON = require('./grups.json');
var usersJSON = require('./users.json');
var plantillesJSON = require('./plantilles.json');
var convocatoriasJSON = require('./convocatorias.json');
var actasJSON = require('./actas.json');
var acordsJSON = require('./acords.json');

//Guardar fecha y hora actual
const currentDate = new Date();
const isoDate = currentDate.toISOString().slice(0, 10); // obtiene la fecha en formato ISO 8601
//const isoTime = currentDate.toISOString().slice(11, 16); // obtiene la hora en formato ISO 8601

var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(
    function () {
      console.log('BASE DE DATOS CONECTADA'); 

      seeder().then( function() {
        mongoose.connection.close();
      });
      
    }
  )
  .catch("when the error happened")

  async function seeder() {
    // Esborrar contingut col·leccions
    try {
        await User.collection.drop();
        await Grup.collection.drop();
        await Plantilla.collection.drop();
        await Convocatoria.collection.drop();
        await Acta.collection.drop();
        await Acord.collection.drop();
        
    } catch(error) {
        console.log('Error esborrant dades...')
    }

    var plantilles = await Plantilla.insertMany(plantillesJSON.plantilles);
   
    // REVISAR PORQUE NO SE ENLAZAN LOS ROLES CON LOS USUARIOS
    /*console.log(usersJSON.users[0].rol);
    console.log(rols[6].nom);
    usersJSON.users[0].rol = [rols[6].id];
    usersJSON.users[1].rol = [rols[0].id];
    usersJSON.users[2].rol = [rols[1].id];*/

    
    for(var i =0; i<  usersJSON.users.length; i ++) {
      usersJSON.users[i].password =  await bcrypt.hash(usersJSON.users[i].password,12);
    }

    var users = await User.insertMany(usersJSON.users);

    grupsJSON.grups[0].membres = [users[0].id,users[2].id];
    grupsJSON.grups[1].membres = [users[1].id];

    var grups = await Grup.insertMany(grupsJSON.grups);

    convocatoriasJSON.convocatorias[0].data = currentDate;
    //convocatoriasJSON.convocatorias[0].horaInici = currentDate;
    convocatoriasJSON.convocatorias[0].horaInici = "09:10";
    convocatoriasJSON.convocatorias[0].convocats = grups[0].id;
    convocatoriasJSON.convocatorias[0].plantilla = plantilles[0].id;
    convocatoriasJSON.convocatorias[0].responsable = users[0].id;

    convocatoriasJSON.convocatorias[1].data = currentDate;
    //convocatoriasJSON.convocatorias[1].horaInici = currentDate;
    convocatoriasJSON.convocatorias[1].horaInici = "08:10";
    convocatoriasJSON.convocatorias[1].convocats = grups[1].id;
    convocatoriasJSON.convocatorias[1].plantilla = plantilles[1].id;
    convocatoriasJSON.convocatorias[1].responsable = users[1].id;

    var convocatorias = await Convocatoria.insertMany(convocatoriasJSON.convocatorias);

    acordsJSON.acords[0].dataInici = currentDate;
    acordsJSON.acords[1].dataInici = currentDate;

    acordsJSON.acords[0].dataFinal = currentDate;
    acordsJSON.acords[1].dataFinal = currentDate;

    // Elimina estas dos líneas
    acordsJSON.acords[0].acta = null; // Limpiamos el campo acta
    acordsJSON.acords[1].acta = null; // Limpiamos el campo acta

    var acords = await Acord.insertMany(acordsJSON.acords); // Cambiar Acords por Acord

    actasJSON.actas[0].convocatoria = convocatorias[0].id;
    actasJSON.actas[1].convocatoria = convocatorias[1].id;

    actasJSON.actas[0].acords = [acords[0].id]; // Asignamos el id del primer acuerdo
    actasJSON.actas[1].acords = [acords[1].id]; // Asignamos el id del segundo acuerdo

    var actas = await Acta.insertMany(actasJSON.actas);
}