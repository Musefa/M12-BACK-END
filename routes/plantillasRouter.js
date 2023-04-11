var express = require("express");
var router = express.Router();
var cors = require("cors");
var authenticateToken = require("../middlewares/authenticateToken");

const corsOptions = {
    origin: "http://localhost:3000", // Cambia esto al dominio de tu frontend en producción
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  router.use(cors(corsOptions));

const plantilla_controller = require("../controllers/plantillasController");

router.get("/", authenticateToken, plantilla_controller.list);

router.get("/create", plantilla_controller.create_get);
router.post("/create", plantilla_controller.rules,plantilla_controller.create_post);

router.get("/delete/:id", plantilla_controller.delete_get);
router.post("/delete/:id", plantilla_controller.delete_post);

router.get("/update/:id", plantilla_controller.update_get);
router.post("/update/:id", plantilla_controller.rules, plantilla_controller.update_post);


module.exports = router;
