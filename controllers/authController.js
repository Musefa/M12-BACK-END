const User = require("../models/user");
const bcrypt = require('bcryptjs');
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');

class authController {

  static login_get(req, res, next) {
    res.render('users/login');
  }

  static login_post(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      var message = 'Email and password must not be empty.';
      return res.status(400).json({ message });
    }
    else {
      var email = req.body.email;
      var password = req.body.password;

      User.findOne({ email: email })
        .exec(function (err, user) {
          if (err) {
            console.error(err);
            return res.status(500).send('Error al realizar la consulta a la base de datos');
          }
          if (!user) {
            var message = 'User not found. Login not possible';
            res.render('users/login', { message: message });
          } else {
            if (bcrypt.compareSync(password, user.password)) {
              var userData = {
                'userId': user.id,
                'nom': user.nom,
                'cognom': user.cognom,
                'email': user.email,
                'role': user.role,
              }

              req.session.data = userData;

              const userToken = {
                userId: user.id,
                userRole: user.role,
              };
              const token = jwt.sign(userToken, process.env.SECRET, { expiresIn: '1h' });
              const msg = { token, userData };
              res.status(200).json(msg);
            } else {
              var message = 'Password incorrect. Login not possible';
              res.status(400).json({ message });
            }
          }
        });
    }
  }

  static register_get(req, res, next) {
    var user = {
      "nom": "",
      "cognom": "",
      "email": ""
    }
    res.render('users/register', { user: user });
  }

  static async register_post(req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty) {
      var user = {
        "nom": req.body.nom,
        "cognom": req.body.cognom,
        "email": req.body.email,
      }
      res.render('users/register', { errors: errors.array(), user: user });
    } else {
      const hashpwd = await bcrypt.hash(req.body.password, 12);
      var user = new User({
        nom: req.body.nom,
        cognom: req.body.cognom,
        email: req.body.email,
        password: hashpwd,
        role: ["professor"]
      });

      User.create(user, (error, newUser) => {
        if (error) {
          res.status(500).json({ error });
        } else {
          const userData = {
            userId: newUser.id,
            nom: newUser.nom,
            cognom: newUser.cognom,
            email: newUser.email,
            role: newUser.role,
          };
          const userToken = {
            userId: newUser.id,
            userRole: newUser.role,
          };
          const token = jwt.sign(userToken, process.env.SECRET, { expiresIn: '23h' });
          res.status(201).json({ message: 'User created successfully', userData, token });
        }
      });
    }
  }

  static logout_get(req, res, next) {
    req.session.destroy(function () {
      res.clearCookie("M12");
      res.redirect("/");
    });
  }

}

module.exports = authController;
