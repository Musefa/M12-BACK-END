var Acta = require("../models/acta");
var Acord = require("../models/acord");

const { body, validationResult } = require("express-validator");

const entities = require("entities");

class AcordController {
    static rules = [
        body("dataInici")
            .notEmpty()
            .withMessage("La fecha de inicio no puede estar vacía.")
            .isISO8601()
            .withMessage("La fecha de inicio debe tener formato ISO8601 (YYYY-MM-DD)."),
        body("dataFinal")
            .notEmpty()
            .withMessage("La fecha final no puede estar vacía.")
            .isISO8601()
            .withMessage("La fecha final debe tener formato ISO8601 (YYYY-MM-DD)."),
        body("descripcio")
            .notEmpty()
            .withMessage("La descripción no puede estar vacía.")
            .isLength({ max: 500 })
            .withMessage("La descripción no puede tener más de 500 caracteres."),
        body("acta")
            .notEmpty()
            .withMessage("Debe seleccionar un acta.")
            .isMongoId()
            .withMessage("El acta seleccionada no es válida."),
    ];

    static async list(req, res, next) {
        Acord.find()
            .populate({
                path: 'acta',
                model: 'Acta',
                populate: {
                    path: 'convocatoria',
                    model: 'Convocatoria',
                    populate: {
                        path: 'responsable',
                        model: 'User'
                    }
                }
            })
            .exec(function (err, list) {
                if (err) {
                    var err = new Error("There was an unexpected problem retrieving your acta list");
                    err.status = 404;
                    return next(err);
                }
                return res.render('acords/list', { list: list, htmlDecode: entities.decode });
            });
    }

    static async create_get(req, res, next) {

        // Fem anar la versió async-wait per recuperar dades
        // Els errors s'han de capturar amb try-catch
        try {
            const acta_list = await Acta.find().populate('convocatoria');

            // En blanc, per renderitzar el formulari el primer cop
            // i que les variables existeixin a la vista

            var acord = {
                dataInici: '',
                dataFinal: '',
                descripcio: '',
                acta: '',
            };

            return res.render('acords/new', {
                actaList: acta_list,
                acord: acord, htmlDecode: entities.decode
            })
        }
        catch (error) {
            var err = new Error("Hubo un problema al mostrar el formulario de nuevo acuerdo");
            err.status = 404;
            return next(err);
        }
    }

    static async create_post(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            try {
                const acta_list = await Acta.find();

                res.render('acords/new', {
                    actaList: acta_list,
                    errors: errors.array(),
                    acord: req.body
                })
            }
            catch (error) {
                var err = new Error("Hubo un problema al mostrar el formulario de nuevo acuerdo");
                err.status = 404;
                return next(err);
            }
        }
        else {
            try {
                var newAcord = await Acord.create(req.body);
                res.redirect('/acords');
            }
            catch (error) {
                var err = new Error("Hubo un problema al guardar el nuevo acuerdo");
                err.status = 404;
                return next(err);
            }
        }
    }

    static async update_get(req, res, next) {
        try {
            const acta_list = await Acta.find().populate('convocatoria');
            const acord = await Acord.findById(req.params.id).populate('acta');

            if (acord == null) {
                var err = new Error("Acuerdo no encontrado");
                err.status = 404;
                return next(err);
            }

            res.render("acords/update", {
                acord: acord,
                actaList: acta_list, htmlDecode: entities.decode
            });

        }
        catch (error) {
            var err = new Error("Hubo un problema al mostrar el acuerdo seleccionado");
            err.status = 404;
            next(err);
        }
    }
    static async update_post(req, res, next) {
        try {
            const acta_list = await Acta.find();

            const acord = new Acord({
                dataInici: req.body.dataInici,
                dataFinal: req.body.dataFinal,
                descripcio: req.body.descripcio,
                acta: req.body.acta,
                _id: req.params.id,
            });

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                res.render('acords/update', {
                    acord: acord,
                    errors: errors.array(),
                    actaList: acta_list
                });
            }
            else {
                Acord.findByIdAndUpdate(
                    req.params.id,
                    acord,
                    {},
                    function (err, updatedAcord) {
                        if (err) {
                            return next(err);
                        }
                        res.redirect('/acords');
                    });
            }
        }
        catch (error) {
            var err = new Error("Hubo un problema al actualizar el acuerdo");
            err.status = 404;
            next(err);
        }
    }

    // Mostrar formulario para confirmar la eliminación
    static delete_get(req, res, next) {
        res.render("acords/delete", { id: req.params.id });
    }

    // Eliminar acuerdo de la base de datos
    static async delete_post(req, res, next) {
        Acord.findByIdAndRemove(req.params.id, function (error) {
            if (error) {
                var error = new Error("Hubo un problema al eliminar el acuerdo");
                error.status = 404;
                next(error);
            } else {
                res.redirect('/acords');
            }
        });
    }


}

module.exports = AcordController;