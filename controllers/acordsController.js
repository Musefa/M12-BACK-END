const Acta = require("../models/acta");
const Acord = require("../models/acord");
const { validationResult } = require("express-validator");

class AcordController {

    static async list(req, res, next) {
        Acord.find()
            .populate('creador')
            .populate({
                path: 'acta',
                model: 'Acta',
                populate: {
                    path: 'convocatoria',
                    model: 'Convocatoria',
                    populate: [
                        {
                            path: 'responsable',
                            model: 'User',
                        },
                        {
                            path: 'convocats',
                            model: 'Grup',
                            populate: {
                                path: 'membres',
                                model: 'User',
                            },
                        },
                    ],
                },
            })
            .exec(function (err, list) {
                if (err) {
                    return res.status(404).json({ error: "There was an unexpected problem retrieving your acta list" });
                }
                return res.status(200).json({ list: list });
            });
    }

    static async create_get(req, res, next) {
        try {
            const acta_list = await Acta.find().populate('convocatoria');

            var acord = {
                nom: '',
                dataInici: '',
                dataFinal: '',
                descripcio: '',
                acta: '',
                creador: '',
            };

            return res.status(200).json({
                actaList: acta_list,
                acord: acord
            });
        }
        catch (error) {
            return res.status(404).json({ error: "Hubo un problema al mostrar el formulario de nuevo acuerdo" });
        }
    }

    static async create_post(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            try {
                const acta_list = await Acta.find();

                return res.status(400).json({
                    actaList: acta_list,
                    errors: errors.array(),
                    acord: req.body
                });
            }
            catch (error) {
                return res.status(404).json({ error: "Hubo un problema al mostrar el formulario de nuevo acuerdo" });
            }
        }
        else {
            try {
                var newAcord = await Acord.create(req.body);
                return res.status(201).json(newAcord);
            }
            catch (error) {
                return res.status(404).json({ error: "Hubo un problema al guardar el nuevo acuerdo" });
            }
        }
    }

    static async update_get(req, res, next) {
        try {
            const acta_list = await Acta.find().populate('convocatoria');
            const acord = await Acord.findById(req.params.id).populate('acta').populate('creador');

            if (acord == null) {
                return res.status(404).json({ error: "Acuerdo no encontrado" });
            }

            return res.status(200).json({
                acord: acord,
                actaList: acta_list
            });

        }
        catch (error) {
            return res.status(404).json({ error: "Hubo un problema al mostrar el acuerdo seleccionado" });
        }
    }

    static async update_post(req, res, next) {
        try {
            const acta_list = await Acta.find();

            const acord = new Acord({
                nom: req.body.nom,
                dataInici: req.body.dataInici,
                dataFinal: req.body.dataFinal,
                descripcio: req.body.descripcio,
                acta: req.body.acta,
                creador: req.body.creador,
                _id: req.params.id,
            });

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
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
                            return res.status(404).json({ error: "Hubo un problema al actualizar el acuerdo" });
                        }
                        return res.status(200).json(updatedAcord);
                    });
            }
        }
        catch (error) {
            return res.status(404).json({ error: "Hubo un problema al actualizar el acuerdo" });
        }
    }

    static delete_get(req, res, next) {
        return res.status(200).json({ id: req.params.id });
    }

    static async delete_post(req, res, next) {
        Acord.findByIdAndRemove(req.params.id, function (error) {
            if (error) {
                return res.status(404).json({ error: "Hubo un problema al eliminar el acuerdo" });
            } else {
                return res.status(200).json({ message: "Acuerdo eliminado correctamente" });
            }
        });
    }
}

module.exports = AcordController;