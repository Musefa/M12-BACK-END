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
      .populate('membres')  // Carregar les dades de l'objecte Publisher amb el que està relacionat
      .exec(function (err, list) {
        // En cas d'error

        if (err) {
          // Crea un nou error personalitzat
          var err = new Error("There was an unexpected problem retrieving your book list");
          err.status = 404;
          // i delega el seu tractament al gestor d'errors
          return next(err);
        }
        //console.log(list); // imprime los resultados en la consola para depurar
        // Tot ok: mostra el llistat
        return res.render('grups/list', { list: list, htmlDecode: entities.decode })
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
      return res.render('grups/new',
        {
          usersList: users_list,
          grups: grup, htmlDecode: entities.decode
        })
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

    // Recuperem els errors possibles de validació
    const errors = validationResult(req);

    // Tenim errors en les dades enviades
    if (!errors.isEmpty()) {

      try {
        // Recupero llistats necessaris
        var users_list = await User.find();


        // Si no s'ha seleccionat cap checkbox 
        // hem de tenir en compte que la variable req.body.genre no existirà      
        if (typeof req.body.user === "undefined") req.body.user = [];

        // mostro formulari i li passo llistats
        // i els errors en format array per mostrar-los a usuari
        res.render('grups/new',
          {
            usersList: users_list,
            errors: errors.array(),
            grups: req.body, htmlDecode: entities.decode
          })
      }
      catch (error) {
        var err = new Error("There was a problem showing the new book form");
        err.status = 404;
        return next(err);

      }

    }
    else // cap errada en el formulari
    {
      // Crear un array amb únicament els autors emplenats
      const users = [];
      req.body.membres.forEach(function (user) {
        if (user.name != "")
          users.push(user);
      });
      req.body.membres = users;

      // Si no s'ha seleccionat cap checkbox  
      if (typeof req.body.membres === "undefined") req.body.membres = [];

      try {
        // req.body.title=""; // Descomenta per generar un error per provar
        var newGrup = await Grup.create(req.body);
        res.redirect('/grups')
      }
      catch (error) {
        var err = new Error("There was an unexpected problem saving your book");
        err.status = 404;
        return next(err);
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

      var users_list = await User.find();

      // Només desaré els autors que s'han emplenat!
      const users = [];
      req.body.membres.forEach(function (user) {
        if (user.name != "")
          users.push(user);
      });

      const grup = new Grup({
        nom: req.body.nom,
        tipus: req.body.tipus,
        membres: users,
        _id: req.params.id, // This is required, or a new ID will be assigned!
      });

      // Si no s'ha seleccionat cap checkbox      
      if (typeof req.body.membres === "undefined") req.body.membres = [];


      const errors = validationResult(req);

      if (!errors.isEmpty()) {

        res.render('grups/update',
          {
            grups: grup,
            errors: errors.array(),
            usersList: users_list, htmlDecode: entities.decode
          });
      }
      else {

        Grup.findByIdAndUpdate(
          req.params.id,
          grup,
          {},
          function (err, updatedGrup) {
            if (err) {
              return next(err);
            }
            res.redirect('/grups');

          });
      }
    }
    catch (error) {
      var err = new Error("There was an unexpected problem updating the grup");
      err.status = 404;
      next(err)
    }

  }

  // Mostrar formulari per confirmar esborrat
  static delete_get(req, res, next) {

    res.render("grups/delete", { id: req.params.id });

  }

  // Esborrar llibre de la base de dades
  static async delete_post(req, res, next) {

    Grup.findByIdAndRemove(req.params.id, function (error) {
      if (error) {
        var error = new Error("There was an unexpected problem deleting the grup");
        error.status = 404;
        next(error)
      } else {

        res.redirect('/grups')
      }
    })
  }

}

module.exports = GrupController;