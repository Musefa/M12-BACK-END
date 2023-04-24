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

const user_controller = require("../controllers/userController");

router.post("/update/:id", authenticateToken, user_controller.update_post);

module.exports = router;