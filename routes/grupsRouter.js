var express = require("express");
var middelware = require("../middlewares/authenticate");
var router = express.Router();

const grup_controller = require("../controllers/grupsController");

router.use([middelware.isAuth,middelware.hasRole('administrador')]);

router.get("/", grup_controller.list);

router.get("/create", grup_controller.create_get);
router.post("/create", grup_controller.rules,grup_controller.create_post);

router.get("/delete/:id", grup_controller.delete_get);
router.post("/delete/:id", grup_controller.delete_post);

router.get("/update/:id", grup_controller.update_get);
router.post("/update/:id", grup_controller.rules, grup_controller.update_post);


module.exports = router;