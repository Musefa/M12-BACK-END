var express = require("express");
var middleware = require("../middlewares/authenticate");
var router = express.Router();

const acord_controller = require("../controllers/acordsController");

router.use([middleware.isAuth, middleware.hasRole('administrador')]);

router.get("/", acord_controller.list);

router.get("/create", acord_controller.create_get);
router.post("/create", acord_controller.rules, acord_controller.create_post);

router.get("/delete/:id", acord_controller.delete_get);
router.post("/delete/:id", acord_controller.delete_post);

router.get("/update/:id", acord_controller.update_get);
router.post("/update/:id", acord_controller.rules, acord_controller.update_post);

module.exports = router;
