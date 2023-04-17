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

const convocatoria_controller = require("../controllers/convocatoriasController");

router.get("/", authenticateToken, convocatoria_controller.list);

router.get("/create",authenticateToken,  convocatoria_controller.create_get);
router.post("/create", authenticateToken, convocatoria_controller.create_post);

router.get("/delete/:id", authenticateToken, convocatoria_controller.delete_get);
router.post("/delete/:id", authenticateToken, convocatoria_controller.delete_post);

router.get("/update/:id", authenticateToken, convocatoria_controller.update_get);
router.post("/update/:id", authenticateToken, convocatoria_controller.update_post);


module.exports = router;