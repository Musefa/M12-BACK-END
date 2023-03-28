var express = require("express");
var middelware = require("../middlewares/authenticate");
var router = express.Router();

const convocatoria_controller = require("../controllers/convocatoriasController");

router.use([middelware.isAuth,middelware.hasRole('administrador')]);

router.get("/", convocatoria_controller.list);

router.get("/create", convocatoria_controller.create_get);
router.post("/create", convocatoria_controller.rules, convocatoria_controller.create_post);

router.get("/delete/:id", convocatoria_controller.delete_get);
router.post("/delete/:id", convocatoria_controller.delete_post);

router.get("/update/:id", convocatoria_controller.update_get);
router.post("/update/:id", convocatoria_controller.rules, convocatoria_controller.update_post);


module.exports = router;