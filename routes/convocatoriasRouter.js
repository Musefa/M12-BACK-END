const express = require("express");
const router = express.Router();
const cors = require("cors");
const authenticateToken = require("../middlewares/authenticateToken");

const corsOptions = {
    origin: process.env.API_URL,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

router.use(cors(corsOptions));

const convocatoria_controller = require("../controllers/convocatoriasController");

router.get("/", authenticateToken, convocatoria_controller.list);

router.get("/create", authenticateToken, convocatoria_controller.create_get);
router.post("/create", authenticateToken, convocatoria_controller.create_post);

router.get("/delete/:id", authenticateToken, convocatoria_controller.delete_get);
router.post("/delete/:id", authenticateToken, convocatoria_controller.delete_post);

router.get("/update/:id", authenticateToken, convocatoria_controller.update_get);
router.post("/update/:id", authenticateToken, convocatoria_controller.update_post);


module.exports = router;