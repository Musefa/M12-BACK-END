require('dotenv').config({ path: '.env' })
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const Grup = require("../models/grup");
const Plantilla = require("../models/plantilla");
const User = require("../models/user");
const Convocatoria = require("../models/convocatoria");
const Acta = require("../models/acta");
const Acord = require("../models/acord");

const grupsJSON = require('./grups.json');
const usersJSON = require('./users.json');
const plantillesJSON = require('./plantilles.json');
const convocatoriasJSON = require('./convocatorias.json');
const actasJSON = require('./actas.json');
const acordsJSON = require('./acords.json');

const currentDate = new Date();

const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(
    function () {
      console.log('BASE DE DATOS CONECTADA');

      seeder().then(function () {
        mongoose.connection.close();
      });

    }
  )
  .catch("when the error happened")

async function seeder() {
  try {
    await User.collection.drop();
    await Grup.collection.drop();
    await Plantilla.collection.drop();
    await Convocatoria.collection.drop();
    await Acta.collection.drop();
    await Acord.collection.drop();

  } catch (error) {
    console.log('Error esborrant dades...')
  }

  var plantilles = await Plantilla.insertMany(plantillesJSON.plantilles);

  for (var i = 0; i < usersJSON.users.length; i++) {
    usersJSON.users[i].password = await bcrypt.hash(usersJSON.users[i].password, 12);
  }

  var users = await User.insertMany(usersJSON.users);

  grupsJSON.grups[0].membres = [users[0].id, users[2].id];
  grupsJSON.grups[1].membres = [users[1].id];

  grupsJSON.grups[0].creador = users[0].id;
  grupsJSON.grups[1].creador = users[1].id;

  var grups = await Grup.insertMany(grupsJSON.grups);

  convocatoriasJSON.convocatorias[0].data = currentDate;
  convocatoriasJSON.convocatorias[0].horaInici = "09:10";
  convocatoriasJSON.convocatorias[0].convocats = grups[0].id;
  convocatoriasJSON.convocatorias[0].plantilla = plantilles[0].id;
  convocatoriasJSON.convocatorias[0].responsable = users[0].id;
  convocatoriasJSON.convocatorias[0].creador = users[0].id;

  convocatoriasJSON.convocatorias[1].data = currentDate;
  convocatoriasJSON.convocatorias[1].horaInici = "08:10";
  convocatoriasJSON.convocatorias[1].convocats = grups[1].id;
  convocatoriasJSON.convocatorias[1].plantilla = plantilles[1].id;
  convocatoriasJSON.convocatorias[1].responsable = users[1].id;
  convocatoriasJSON.convocatorias[1].creador = users[1].id;

  var convocatorias = await Convocatoria.insertMany(convocatoriasJSON.convocatorias);

  acordsJSON.acords[0].dataInici = currentDate;
  acordsJSON.acords[1].dataInici = currentDate;

  acordsJSON.acords[0].dataFinal = currentDate;
  acordsJSON.acords[1].dataFinal = currentDate;

  acordsJSON.acords[0].acta = null;
  acordsJSON.acords[1].acta = null;

  acordsJSON.acords[0].creador = users[0].id;
  acordsJSON.acords[1].creador = users[1].id;

  var acords = await Acord.insertMany(acordsJSON.acords);

  actasJSON.actas[0].convocatoria = convocatorias[0].id;
  actasJSON.actas[1].convocatoria = convocatorias[1].id;

  actasJSON.actas[0].acords = [acords[0].id];
  actasJSON.actas[1].acords = [acords[1].id];

  actasJSON.actas[0].creador = users[0].id;
  actasJSON.actas[1].creador = users[1].id;

  var actas = await Acta.insertMany(actasJSON.actas);
}