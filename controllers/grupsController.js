var Grup = require("../models/grup");
var User = require("../models/user");

const { body, validationResult } = require("express-validator");

const entities = require("entities");

class GrupController {
  static rules = [
    body("nom")
      .notEmpty()
      .withMessage("El nombre no puede estar vacío.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("tipus")
      .notEmpty()
      .withMessage("El tipo no puede estar vacío.")
      .trim()
      .isLength({ min: 1 }),
    body("membres.*")
      .notEmpty()
      .withMessage("Debe seleccionar al menos un miembro.")
      .isMongoId()
      .withMessage("El miembro seleccionado no es válido.")
  ];

  static async list(req, res, next) {
    Grup.find()
      .populate('membres')
      .exec(function (err, list) {
        if (err) {
          return res.status(404).json({
            error: {
              message: "There was an unexpected problem retrieving your book list"
            }
          });
        }
        // Retorna la lista en formato JSON
        return res.status(200).json({
          list: list
        });
      });
  }


  static async create_get(req, res, next) {

    // Fem anar la versió async-wait per recuperar dades
    // Els errors s'han de capturar amb try-catch
    try {
      const users_list = await User.find();

      // En blanc, per renderitzar el formulari el primer cop
      // i que les variables existeixin a la vista
      var grup = {
        nom: '',
        tipus: '',
        membres: [],
      };

      // mostrem el formulari i li passem les dades necessàries
      return res.status(200).json({
        usersList: users_list,
        grup: grup,
      });
    }
    catch (error) {
      // En cas d'error al recuperar els llistats necessaris
      // li diem al gestor d'errors que el tracti...
      var err = new Error("There was a problem showing the new book form");
      err.status = 404;
      return next(err);

    }
  }

  static async create_post(req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      const users = [];
      req.body.membres.forEach(function (user) {
        if (user.name != "")
          users.push(user);
      });
      req.body.membres = users;

      if (typeof req.body.membres === "undefined") req.body.membres = [];

      try {
        var newGrup = await Grup.create(req.body);
        return res.status(201).json({ newGrup });
      }
      catch (error) {
        return res.status(500).json({ error: "There was an unexpected problem saving your book" });
      }
    }
  }

  static async update_get(req, res, next) {

    try {
      const users_list = await User.find();
      const grup = await Grup.findById(req.params.id)
        .populate('membres');

      if (grup == null) { // No results                
        var err = new Error("Grup not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("grups/update", {
        grups: grup,
        usersList: users_list, htmlDecode: entities.decode
      });

    }
    catch (error) {
      var err = new Error("There was an unexpected problem showing the selected grup");
      console.log(error)
      err.status = 404;
      next(err)
    }

  }

  static async update_post(req, res, next) {

    try {
      const users = [];
      req.body.membres.forEach(function (user) {
        if (user.name != "")
          users.push(user);
      });

      const grup = new Grup({
        nom: req.body.nom,
        tipus: req.body.tipus,
        membres: users,
        _id: req.params.id,
      });

      if (typeof req.body.membres === "undefined") req.body.membres = [];

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        Grup.findByIdAndUpdate(
          req.params.id,
          grup,
          {},
          function (err, updatedGrup) {
            if (err) {
              return res.status(500).json({ error: "There was an unexpected problem updating the grup" });
            }
            return res.status(200).json({ updatedGrup });

          });
      }
    }
    catch (error) {
      return res.status(500).json({ error: "There was an unexpected problem updating the grup" });
    }
  }

  // Mostrar formulari per confirmar esborrat
  static delete_get(req, res, next) {

    res.render("grups/delete", { id: req.params.id });

  }

  static async delete_post(req, res, next) {

    Grup.findByIdAndRemove(req.params.id, function (error) {
      if (error) {
        return res.status(500).json({ error: "There was an unexpected problem deleting the grup" });
      } else {
        return res.status(200).json({ message: "Grup deleted successfully" });
      }
    })
  }
}

module.exports = GrupController;