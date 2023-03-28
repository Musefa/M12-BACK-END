var Convocatoria = require("../models/convocatoria");
var Grup = require("../models/grup");
var Plantilla = require("../models/plantilla");
var User = require("../models/user");

const { body, validationResult } = require("express-validator");

const entities = require("entities");

class convocatoriaController {
  static rules = [
    body("data")
      .notEmpty()
      .withMessage("La fecha no puede estar vacía.")
      .isISO8601()
      .withMessage("La fecha debe tener formato ISO8601 (YYYY-MM-DD)."),
    body("horaInici")
      .notEmpty()
      .withMessage("La hora de inicio no puede estar vacía."),
    body("durada")
      .notEmpty()
      .withMessage("La duración no puede estar vacía.")
      .isInt({ min: 1, max: 1440 })
      .withMessage("La duración debe ser un número entre 1 y 24."),
    body("lloc")
      .notEmpty()
      .withMessage("El lugar no puede estar vacío.")
      .isLength({ max: 100 })
      .withMessage("El lugar no puede tener más de 100 caracteres."),
    body("puntsOrdreDia.*")
      .notEmpty()
      .withMessage("El punto del orden del día no puede estar vacío.")
      .isLength({ max: 200 })
      .withMessage("El punto del orden del día no puede tener más de 200 caracteres."),
    body("convocats.*")
      .notEmpty()
      .withMessage("Debe seleccionar al menos un grupo.")
      .isMongoId()
      .withMessage("El grupo seleccionado no es válido."),
    body("plantilla")
      .notEmpty()
      .withMessage("Debe seleccionar una plantilla.")
      .isMongoId()
      .withMessage("La plantilla seleccionada no es válida."),
    body("responsable")
      .notEmpty()
      .withMessage("Debe seleccionar un responsable.")
      .isMongoId()
      .withMessage("El responsable seleccionado no es válido.")
  ];

  static async list(req, res, next) {

    Convocatoria.find()
      .populate({
        path: 'convocats',
        model: 'Grup',
        populate: {
          path: 'membres',
          model: 'User'
        }
      })  // Carregar les dades de l'objecte Publisher amb el que està relacionat    
      .populate('plantilla')
      .populate('responsable') // i les de tots els objectes gèneres relaciponats
      .exec(function (err, list) {
        // En cas d'error
        if (err) {
          // Crea un nou error personalitzat
          var err = new Error("There was an unexpected problem retrieving your convocatoria list");
          err.status = 404;
          // i delega el seu tractament al gestor d'errors
          return next(err);
        }
        // Tot ok: mostra el llistat
        return res.render('convocatorias/list', { list: list, htmlDecode: entities.decode })
      });

  }

  static async create_get(req, res, next) {

    // Fem anar la versió async-wait per recuperar dades
    // Els errors s'han de capturar amb try-catch
    try {
      const grups_list = await Grup.find();
      const plantillas_list = await Plantilla.find();

      // En blanc, per renderitzar el formulari el primer cop
      // i que les variables existeixin a la vista
      var convocatoria = {
        data: '',
        horaInici: '',
        durada: '',
        lloc: '',
        puntsOrdreDia: [],
        convocats: [],
        plantilla: '',
        responsable: ''
      };

      // mostrem el formulari i li passem les dades necessàries
      return res.render('convocatorias/new',
        {
          grupsList: grups_list,
          plantillasList: plantillas_list,
          convo: convocatoria, htmlDecode: entities.decode
        })
    }
    catch (error) {
      // En cas d'error al recuperar els llistats necessaris
      // li diem al gestor d'errors que el tracti...
      var err = new Error("There was a problem showing the new convocatoria form");
      err.status = 404;
      return next(err);

    }
  }

  static async create_post(req, res, next) {

    // Recuperem els errors possibles de validació
    const errors = validationResult(req);

    // Tenim errors en les dades enviades
    if (!errors.isEmpty()) {

      try {
        // Recupero llistats necessaris
        var grups_list = await Grup.find();
        var plantillas_list = await Plantilla.find();

        // mostro formulari i li passo llistats
        // i els errors en format array per mostrar-los a usuari
        res.render('convocatorias/new',
          {
            grupsList: grups_list,
            plantillasList: plantillas_list,
            errors: errors.array(),
            convocatoria: req.body, htmlDecode: entities.decode
          })
      }
      catch (error) {
        var err = new Error("There was a problem showing the new convocatoria form");
        err.status = 404;
        return next(err);

      }

    }
    else // cap errada en el formulari
    {
      //const horaIniciDate = new Date(req.body.horaInici);
      //const horaInici = horaIniciDate.getHours() + ':' + horaIniciDate.getMinutes();

      // Obtener el valor del input tipo time
      //const horaIniciInput = document.querySelector('input[name="horaInici"]');
      const horaIniciValue = req.body.horaInici;

      // Convertir el valor a un string en formato HH:MM
      const horaIniciDate = new Date();
      const [hours, minutes] = horaIniciValue.split(':');
      horaIniciDate.setHours(hours, minutes);
      const horaIniciString = horaIniciDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

      // Asignar la hora de inicio formateada a la propiedad horaInici de req.body
      req.body.horaInici = horaIniciString;

      // Crear un array amb únicament els autors emplenats
      const grups = [];
      req.body.convocats.forEach(function (grup) {
        if (grup != "")
          grups.push(grup);
      });
      req.body.convocats = grups;

      // Si no s'ha seleccionat cap checkbox  
      if (typeof req.body.convocats === "undefined") req.body.convocats = [];

      // Crear un array amb únicament els autors emplenats
      const punts = [];
      req.body.puntsOrdreDia.forEach(function (punt) {
        if (punt != "")
          punts.push(punt);
      });
      req.body.puntsOrdreDia = punts;

      // Si no s'ha seleccionat cap checkbox  
      if (typeof req.body.puntsOrdreDia === "undefined") req.body.puntsOrdreDia = [];

      try {
        // req.body.title=""; // Descomenta per generar un error per provar
        var newConvocatoria = await Convocatoria.create(req.body);
        res.redirect('/convocatorias')
      }
      catch (error) {
        var err = new Error("There was an unexpected problem saving your convocatoria");
        err.status = 404;
        return next(err);
      }

    }
  }

  static async update_get(req, res, next) {
    try {
      const users_list = await User.find();
      const grups_list = await Grup.find();
      const plantillas_list = await Plantilla.find();
      const convocatoria = await Convocatoria.findById(req.params.id)
        .populate({
          path: 'convocats',
          model: 'Grup',
          populate: {
            path: 'membres',
            model: 'User'
          }
        })
        .populate('plantilla')
        .populate('responsable')

      if (convocatoria == null) { // No results                
        var err = new Error("Convocatoria not found");
        err.status = 404;
        return next(err);
      }
      res.render("convocatorias/update", {
        convo: convocatoria,
        grupsList: grups_list,
        plantillasList: plantillas_list,
        usersList: users_list,
        convocats: convocatoria.convocats, htmlDecode: entities.decode // Nueva variable que contiene la lista de convocados
      });
    }
    catch (error) {
      var err = new Error("There was an unexpected problem showing the selected convocatoria");
      console.log(error)
      err.status = 404;
      next(err)
    }
  }

  static async update_post(req, res, next) {

    try {
      const users_list = await User.find();
      const grups_list = await Grup.find();
      const plantillas_list = await Plantilla.find();

      // Només desaré els autors que s'han emplenat!
      const grups = [];
      if (typeof req.body.convocats !== "undefined") {
        req.body.convocats.forEach(function (grup) {
          if (grup != "")
            grups.push(grup);
        });
      }


      const punts = [];
      if (typeof req.body.puntsOrdreDia !== "undefined") {
        req.body.puntsOrdreDia.forEach(function (punt) {
          if (punt != "")
            punts.push(punt);
        });
      }


      const convocatoria = new Convocatoria({
        data: req.body.data,
        horaInici: req.body.horaInici,
        durada: req.body.durada,
        lloc: req.body.lloc,
        puntsOrdreDia: punts,
        convocats: grups,
        plantilla: req.body.plantilla,
        responsable: req.body.responsable,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });

      if (typeof req.body.convocats === "undefined") req.body.convocats = [];
      if (typeof req.body.puntsOrdreDia === "undefined") req.body.puntsOrdreDia = [];


      const errors = validationResult(req);

      if (!errors.isEmpty()) {

        res.render('convocatorias/update',
          {
            convo: convocatoria,
            errors: errors.array(),
            grupsList: grups_list,
            usersList: users_list,
            plantillasList: plantillas_list, htmlDecode: entities.decode
          });
      }
      else {

        Convocatoria.findByIdAndUpdate(
          req.params.id,
          convocatoria,
          {},
          function (err, updatedConvocatoria) {
            if (err) {
              return next(err);
            }
            res.redirect('/convocatorias');

          });
      }
    }
    catch (error) {
      var err = new Error("There was an unexpected problem updating the convocatoria");
      err.status = 404;
      next(err)
    }

  }

  static delete_get(req, res, next) {

    res.render("convocatorias/delete", { id: req.params.id });

  }

  // Esborrar llibre de la base de dades
  static async delete_post(req, res, next) {

    Convocatoria.findByIdAndRemove(req.params.id, function (error) {
      if (error) {
        var error = new Error("There was an unexpected problem deleting the convocatoria");
        error.status = 404;
        next(error)
      } else {

        res.redirect('/convocatorias')
      }
    })
  }

}

module.exports = convocatoriaController;