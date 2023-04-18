const Plantilla = require("../models/plantilla");
const { validationResult } = require("express-validator");

class PlantillaController {

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

      res.json(result);
    });
  }

  static create_get(req, res, next) {
    var plantilla = {
      "nom": "",
      "puntsOrdreDia": []
    }
    res.render('plantillas/new', { plantilla: plantilla });
  }

  static create_post(req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      var nom = req.body.nom;
      var puntsOrdreDia = req.body.puntsOrdreDia;

      var newPlantilla = new Plantilla({
        nom: nom,
        puntsOrdreDia: puntsOrdreDia
      });

      newPlantilla.save(function (error) {
        if (error) {
          res.status(500).json({ error: "There was a problem saving the new template." });
        } else {
          res.status(201).json(newPlantilla);
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

      res.render("plantillas/update", { plantilla: plantilla });
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
      res.status(400).json({ errors: errors.array() });
    } else {
      Plantilla.findByIdAndUpdate(
        req.params.id,
        {
          nom: req.body.nom,
          puntsOrdreDia: req.body.puntsOrdreDia
        },
        { runValidators: true },
        function (err, plantillaFound) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.status(200).json(plantillaFound);
          }
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
        res.status(500).json({ error: "Error deleting Plantilla" });
      } else {
        res.status(200).json({ message: "Plantilla deleted successfully" });
      }
    });
  }
}

module.exports = PlantillaController;
