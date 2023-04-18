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

const acta_controller = require("../controllers/actasController");

router.get("/", acta_controller.list);

router.get("/create", authenticateToken, acta_controller.create_get);
router.post("/create", authenticateToken, acta_controller.create_post);

router.get("/delete/:id", authenticateToken, acta_controller.delete_get);
router.post("/delete/:id", authenticateToken, acta_controller.delete_post);

router.get("/update/:id", authenticateToken, acta_controller.update_get);
router.post("/update/:id", authenticateToken, acta_controller.update_post);


module.exports = router;