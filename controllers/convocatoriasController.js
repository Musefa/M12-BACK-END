const Convocatoria = require("../models/convocatoria");
const Grup = require("../models/grup");
const Plantilla = require("../models/plantilla");
const User = require("../models/user");
const { validationResult } = require("express-validator");

class convocatoriaController {

  static async list(req, res, next) {
    Convocatoria.find()
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
      .populate('creador')
      .exec(function (err, list) {
        if (err) {
          var err = new Error("There was an unexpected problem retrieving your convocatoria list");
          err.status = 404;
          return next(err);
        }
        return res.status(200).json({ list: list });
      });
  }


  static async create_get(req, res, next) {

    try {
      const grups_list = await Grup.find();
      const plantillas_list = await Plantilla.find();

      var convocatoria = {
        nom: '',
        data: '',
        horaInici: '',
        durada: '',
        lloc: '',
        puntsOrdreDia: [],
        convocats: [],
        plantilla: '',
        responsable: '',
        creador: ''
      };

      return res.render('convocatorias/new',
        {
          grupsList: grups_list,
          plantillasList: plantillas_list,
          convo: convocatoria
        })
    }
    catch (error) {

      var err = new Error("There was a problem showing the new convocatoria form");
      err.status = 404;
      return next(err);

    }
  }

  static async create_post(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      try {

        var grups_list = await Grup.find();
        var plantillas_list = await Plantilla.find();

        res.status(400).json({ errors: errors.array(), grupsList: grups_list, plantillasList: plantillas_list, convocatoria: req.body });
      } catch (error) {
        res.status(500).json({ error: 'Ha ocurrido un error inesperado al mostrar el formulario de nueva convocatoria.' });
      }
    } else {
      const horaIniciValue = req.body.horaInici;
      const horaIniciDate = new Date();
      const [hours, minutes] = horaIniciValue.split(':');
      horaIniciDate.setHours(hours, minutes);
      const horaIniciString = horaIniciDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

      req.body.horaInici = horaIniciString;

      const grups = [];
      req.body.convocats.forEach(function (grup) {
        if (grup != "")
          grups.push(grup);
      });
      req.body.convocats = grups;

      if (typeof req.body.convocats === "undefined") req.body.convocats = [];

      const punts = [];
      req.body.puntsOrdreDia.forEach(function (punt) {
        if (punt != "")
          punts.push(punt);
      });
      req.body.puntsOrdreDia = punts;

      if (typeof req.body.puntsOrdreDia === "undefined") req.body.puntsOrdreDia = [];

      try {
        var newConvocatoria = await Convocatoria.create(req.body);
        res.json({ message: 'Convocatoria creada correctamente.' });
      } catch (error) {
        res.status(500).json({ error: 'Ha ocurrido un error inesperado al guardar la convocatoria.' });
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
        .populate('creador')

      if (convocatoria == null) {
        var err = new Error("Convocatoria not found");
        err.status = 404;
        return next(err);
      }
      res.render("convocatorias/update", {
        convo: convocatoria,
        grupsList: grups_list,
        plantillasList: plantillas_list,
        usersList: users_list,
        convocats: convocatoria.convocats
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
        nom: req.body.nom,
        data: req.body.data,
        horaInici: req.body.horaInici,
        durada: req.body.durada,
        lloc: req.body.lloc,
        puntsOrdreDia: punts,
        convocats: grups,
        plantilla: req.body.plantilla,
        responsable: req.body.responsable,
        creador: req.body.creador,
        _id: req.params.id,
      });

      if (typeof req.body.convocats === "undefined") req.body.convocats = [];
      if (typeof req.body.puntsOrdreDia === "undefined") req.body.puntsOrdreDia = [];

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array() });
      } else {
        Convocatoria.findByIdAndUpdate(
          req.params.id,
          convocatoria,
          {},
          function (err, updatedConvocatoria) {
            if (err) {
              return next(err);
            }
            res.json({ message: 'Convocatoria actualizada correctamente.' });
          }
        );
      }
    } catch (error) {
      res.status(500).json({ error: 'Ha ocurrido un error inesperado al actualizar la convocatoria.' });
    }
  }

  static delete_get(req, res, next) {

    res.render("convocatorias/delete", { id: req.params.id });

  }

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