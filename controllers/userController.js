const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');

class UserController {
    static async update_post(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        const isCurrentPasswordValid = await bcrypt.compare(
            req.body.currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            res.status(401).json({ error: "Contraseña actual incorrecta" });
            return;
        }

        const updateFields = {
            nom: req.body.nom,
            cognom: req.body.cognom,
            email: req.body.email,
            dni: req.body.dni,
            especialitat: req.body.especialitat,
        };
        if (req.body.newPassword) {
            const hashpwd = await bcrypt.hash(req.body.newPassword, 12);
            updateFields.password = hashpwd;
        }

        User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { runValidators: true, new: true },
            function (err, userFound) {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.status(200).json(userFound);
                }
            }
        );
    }
}

module.exports = UserController;
