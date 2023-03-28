var express = require('express');
var router = express.Router();

// Require user controller.
var authController = require('../controllers/authController');



// GET request for login page.
router.get('/login', authController.login_get);

// POST request for login page.
router.post('/login',authController.loginRules, authController.login_post);

// GET request for logout page.
router.get('/logout', authController.logout_get);

// GET request for create User.
router.get('/register', authController.register_get);

// POST request for create User.
router.post('/register', authController.registerRules, authController.register_post);


module.exports = router;