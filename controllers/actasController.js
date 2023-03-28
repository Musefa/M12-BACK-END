var Convocatoria = require("../models/convocatoria");
var Acta = require("../models/acta");
var Acord = require("../models/acord"); // Añadir el modelo Acord

const { body, validationResult } = require("express-validator");

const entities = require("entities");

class ActaController {
  static rules = [
    body("estat")
      .notEmpty()
      .withMessage("El estado no puede estar vacío.")
      .isIn(["Oberta", "Tancada"])
      .withMessage("El estado debe ser 'Oberta' o 'Tancada'."),
    body("descripcions.*")
      .notEmpty()
      .withMessage("La descripción no puede estar vacía.")
      .isLength({ max: 500 })
      .withMessage("La descripción no puede tener más de 500 caracteres."),
    body("convocatoria")
      .notEmpty()
      .withMessage("Debe seleccionar una convocatoria.")
      .isMongoId()
      .withMessage("La convocatoria seleccionada no es válida."),
    body("acords.*")
      .notEmpty()
      .withMessage("Debe seleccionar al menos un acuerdo.")
      .isMongoId()
      .withMessage("El acuerdo seleccionado no es válido."),
  ];

  static async list(req, res, next) {
    Acta.find()
      .populate('convocatoria')
      .populate('acords')  // Añadir el populate para acords
      .exec(function (err, list) {

        if (err) {
          var err = new Error("There was an unexpected problem retrieving your acta list");
          err.status = 404;
          return next(err);
        }
        return res.render('actas/list', { list: list, htmlDecode: entities.decode })
      });
  }

  static async create_get(req, res, next) {

    try {
      const convocatoria_list = await Convocatoria.find();
      const acord_list = await Acord.find(); // Añadir consulta para obtener acords

      var acta = {
        estat: '',
        descripcions: [],
        convocatoria: '',
        acords: [], // Añadir el campo acords
      };

      return res.render('actas/new',
        {
          convocatoriaList: convocatoria_list,
          acordList: acord_list, // Añadir acordList a la vista
          actas: acta
        })
    }
    catch (error) {
      var err = new Error("There was a problem showing the new acta form");
      err.status = 404;
      return next(err);

    }
  }

  static async create_post(req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

      try {
        const convocatoria_list = await Convocatoria.find();
        const acord_list = await Acord.find(); // Añadir consulta para obtener acords

        if (typeof req.body.descripcions === "undefined") req.body.descripcions = [];
        if (typeof req.body.acords === "undefined") req.body.acords = []; // Añadir verificación para acords

        res.render('actas/new',
          {
            convocatoriaList: convocatoria_list,
            acordList: acord_list, // Añadir acordList a la vista
            errors: errors.array(),
            actas: req.body
          })
      }
      catch (error) {
        var err = new Error("There was a problem showing the new acta form");
        err.status = 404;
        return next(err);

      }

    }
    else {
      const descripcions = [];
      req.body.descripcions.forEach(function (desc) {
        if (desc != "")
          descripcions.push(desc);
      });
      req.body.descripcions = descripcions;

      if (typeof req.body.descripcions === "undefined") req.body.descripcions = [];
      if (typeof req.body.acords === "undefined") req.body.acords = []; // Añadir verificación para acords

      try {
        var newActa = await Acta.create(req.body);
        res.redirect('/actas')
      }
      catch (error) {
        var err = new Error("There was an unexpected problem saving your acta");
        err.status = 404;
        return next(err);
      }
    }
  }

  static async update_get(req, res, next) {

    try {
      const convocatoria_list = await Convocatoria.find();
      const acord_list = await Acord.find(); // Añadir consulta para obtener acords
      const acta = await Acta.findById(req.params.id)
        .populate('convocatoria')
        .populate('acords'); // Añadir populate para acords

      if (acta == null) { // No results                
        var err = new Error("Acta not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("actas/update", {
        actas: acta,
        convocatoriaList: convocatoria_list,
        acordList: acord_list, htmlDecode: entities.decode
      }); // Añadir acordList a la vista

    }
    catch (error) {
      var err = new Error("There was an unexpected problem showing the selected acta");
      console.log(error)
      err.status = 404;
      next(err)
    }

  }

  static async update_post(req, res, next) {

    try {

      const convocatoria_list = await Convocatoria.find();
      const acord_list = await Acord.find(); // Añadir consulta para obtener acords

      const descripcions = [];
      req.body.descripcions.forEach(function (desc) {
        if (desc != "")
          descripcions.push(desc);
      });

      const acta = new Acta({
        estat: req.body.estat,
        descripcions: descripcions,
        convocatoria: req.body.convocatoria,
        acords: req.body.acords, // Añadir el campo acords
        _id: req.params.id,
      });

      if (typeof req.body.descripcions === "undefined") req.body.descripcions = [];
      if (typeof req.body.acords === "undefined") req.body.acords = []; // Añadir verificación para acords

      const errors = validationResult(req);

      if (!errors.isEmpty()) {

        res.render('actas/update',
          {
            actas: acta,
            errors: errors.array(),
            convocatoriaList: convocatoria_list,
            acordList: acord_list
          }); // Añadir acordList a la vista                 
      }
      else {

        Acta.findByIdAndUpdate(
          req.params.id,
          acta,
          {},
          function (err, updatedActa) {
            if (err) {
              return next(err);
            }
            res.redirect('/actas');

          });
      }
    }
    catch (error) {
      var err = new Error("There was an unexpected problem updating the acta");
      err.status = 404;
      next(err)
    }

  }

  static delete_get(req, res, next) {

    res.render("actas/delete", { id: req.params.id });

  }

  static async delete_post(req, res, next) {

    Acta.findByIdAndRemove(req.params.id, function (error) {
      if (error) {
        var error = new Error("There was an unexpected problem deleting the acta");
        error.status = 404;
        next(error)
      } else {
        res.redirect('/actas')
      }
    })
  }
}

module.exports = ActaController;
