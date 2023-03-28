var express = require("express");
var middelware = require("../middlewares/authenticate");
var router = express.Router();

const acta_controller = require("../controllers/actasController");

router.use([middelware.isAuth,middelware.hasRole('administrador')]);

router.get("/", acta_controller.list);

router.get("/create", acta_controller.create_get);
router.post("/create", acta_controller.rules, acta_controller.create_post);

router.get("/delete/:id", acta_controller.delete_get);
router.post("/delete/:id", acta_controller.delete_post);

router.get("/update/:id", acta_controller.update_get);
router.post("/update/:id", acta_controller.rules, acta_controller.update_post);


module.exports = router;