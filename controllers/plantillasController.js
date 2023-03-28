var Plantilla = require("../models/plantilla");

const { body, validationResult } = require("express-validator");

const entities = require("entities");

class PlantillaController {
  static rules = [
    body("nom")
      .notEmpty()
      .withMessage("El nombre no puede estar vacío.")
      .isLength({ max: 20 })
      .withMessage("El nombre no puede tener más de 20 caracteres.")
      .custom(async function (value, { req }) {
        const plantilla = await Plantilla.findOne({ nom: value });
        if (plantilla) {
          if (req.params.id !== plantilla.id) {
            throw new Error("Este nombre de plantilla ya existe.");
          }
        }
        return true;
      }),
    body("puntsOrdreDia.*")
      .notEmpty()
      .withMessage("El punto del orden del día no puede estar vacío.")
      .isLength({ max: 200 })
      .withMessage("El punto del orden del día no puede tener más de 200 caracteres."),
  ];

  static async list(req, res, next) {
    const options = {
      page: req.query.page || 1,
      limit: 10,
      collation: {
        locale: 'en',
      },
    };

    Plantilla.paginate({}, options, function (err, result) {
      if (err) {
        return next(err);
      }

      res.render('plantillas/list', { result: result, htmlDecode: entities.decode })
    });
  }

  static create_get(req, res, next) {
    var plantilla = {
      "nom": "",
      "puntsOrdreDia": []
    }
    res.render('plantillas/new', { plantilla: plantilla, htmlDecode: entities.decode });
  }

  static create_post(req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      var plantilla = {
        "nom": req.body.nom,
        "puntsOrdreDia": req.body.puntsOrdreDia
      }
      res.render('plantillas/new', { errors: errors.array(), plantilla: plantilla })
    }
    else {
      var nom = req.body.nom;
      var puntsOrdreDia = req.body.puntsOrdreDia;

      var newPlantilla = new Plantilla({
        nom: nom,
        puntsOrdreDia: puntsOrdreDia
      });

      newPlantilla.save(function (error) {
        if (error) {
          var err = new Error("There was a problem saving the new template.");
          err.status = 404;
          return next(err);
        } else {
          res.redirect('/plantillas')
        }
      });
    }
  }


  static update_get(req, res, next) {
    Plantilla.findById(req.params.id, function (err, plantilla) {
      if (err) {
        return next(err);
      }
      if (plantilla == null) {
        var err = new Error("Plantilla not found");
        err.status = 404;
        return next(err);
      }

      res.render("plantillas/update", { plantilla: plantilla, htmlDecode: entities.decode });
    });
  }

  static update_post(req, res, next) {
    const errors = validationResult(req);

    var plantilla = new Plantilla({
      nom: req.body.nom,
      puntsOrdreDia: req.body.puntsOrdreDia,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("plantillas/update", { plantilla: plantilla, htmlDecode: entities.decode, errors: errors.array() });

    }
    else {
      Plantilla.findByIdAndUpdate(
        req.params.id,
        {
          nom: req.body.nom,
          puntsOrdreDia: req.body.punts
        },
        { runValidators: true },
        function (err, plantillaFound) {
          if (err) {
            //return next(err);
            res.render("plantillas/update", { plantilla: plantilla, error: err.message, htmlDecode: entities.decode });

          }

          res.redirect('/plantillas');
        }
      );
    }
  }


  static async delete_get(req, res, next) {
    res.render('plantillas/delete', { id: req.params.id })
  }

  static async delete_post(req, res, next) {

    Plantilla.findByIdAndRemove(req.params.id, function (error) {
      if (error) {
        var err = new Error("Error deleting Plantilla");
        err.status = 404;
        return next(err);
      } else {
        res.redirect('/plantillas');
      }
    })
  }
}

module.exports = PlantillaController;
