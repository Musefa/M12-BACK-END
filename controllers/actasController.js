const Convocatoria = require("../models/convocatoria");
const Acta = require("../models/acta");
const Acord = require("../models/acord");
const { validationResult } = require("express-validator");

class ActaController {

  static async list(req, res, next) {
    Acta.find()
      .populate({
        path: 'convocatoria',
        model: 'Convocatoria',
        populate: [
          { path: 'responsable', model: 'User' },
          {
            path: 'convocats',
            model: 'Grup',
            populate: {
              path: 'membres',
              model: 'User',
            },
          },
        ],
      })
      .populate('acords')
      .populate('creador')
      .populate('assistents')
      .exec(function (err, list) {
        if (err) {
          var err = new Error("There was an unexpected problem retrieving your acta list");
          err.status = 404;
          return next(err);
        }
        return res.status(200).json({ list: list });
      });
  }  

  static async create_get(req, res, next) {
    try {
      const convocatoria_list = await Convocatoria.find();
      const acord_list = await Acord.find();

      return res.json({
        convocatoriaList: convocatoria_list,
        acordList: acord_list
      });
    }
    catch (error) {
      return res.status(500).json({ error: "There was a problem showing the new acta form" });
    }
  }

  static async create_post(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      try {
        const convocatoria_list = await Convocatoria.find();
        const acord_list = await Acord.find();

        return res.status(400).json({
          convocatoriaList: convocatoria_list,
          acordList: acord_list,
          errors: errors.array(),
          actas: req.body
        });
      }
      catch (error) {
        return res.status(500).json({ error: "There was a problem showing the new acta form" });
      }
    }
    else {
      const assistents = [];
      req.body.assistents.forEach(function (assistent) {
        if (assistent.name != "")
          assistents.push(assistent);
      });
      req.body.assistents = assistents;

      const descripcions = [];
      req.body.descripcions.forEach(function (desc) {
        if (desc != "")
          descripcions.push(desc);
      });
      req.body.descripcions = descripcions;

      if (typeof req.body.descripcions === "undefined") req.body.descripcions = [];
      if (typeof req.body.assistents === "undefined") req.body.assistents = [];
      if (typeof req.body.acords === "undefined") req.body.acords = [];

      try {
        var newActa = await Acta.create(req.body);
        res.status(201).json(newActa);
      }
      catch (error) {
        return res.status(500).json({ error: "There was an unexpected problem saving your acta" });
      }
    }
  }

  static async update_get(req, res, next) {
    try {
      const convocatoria_list = await Convocatoria.find();
      const acord_list = await Acord.find();
      const acta = await Acta.findById(req.params.id)
        .populate('convocatoria')
        .populate('acords')
        .populate('creador');

      if (acta == null) {
        return res.status(404).json({ error: "Acta not found" });
      }
      return res.json({
        actas: acta,
        convocatoriaList: convocatoria_list,
        acordList: acord_list
      });
    }
    catch (error) {
      return res.status(500).json({ error: "There was an unexpected problem showing the selected acta" });
    }
  }

  static async update_post(req, res, next) {

    try {

      const convocatoria_list = await Convocatoria.find();
      const acord_list = await Acord.find();

      const descripcions = [];
      req.body.descripcions.forEach(function (desc) {
        if (desc != "")
          descripcions.push(desc);
      });

      const assistents = [];
      req.body.assistents.forEach(function (assistent) {
        if (assistent.name != "")
          assistents.push(assistent);
      });
      req.body.assistents = assistents;

      const acta = new Acta({
        nom: req.body.nom,
        estat: req.body.estat,
        descripcions: descripcions,
        convocatoria: req.body.convocatoria,
        acords: req.body.acords,
        creador: req.body.creador,
        assistents: req.body.assistents,
        _id: req.params.id,
      });

      if (typeof req.body.descripcions === "undefined") req.body.descripcions = [];
      if (typeof req.body.assistents === "undefined") req.body.assistents = [];
      if (typeof req.body.acords === "undefined") req.body.acords = [];

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          actas: acta,
          errors: errors.array(),
          convocatoriaList: convocatoria_list,
          acordList: acord_list
        });
      }
      else {
        Acta.findByIdAndUpdate(
          req.params.id,
          acta,
          {},
          function (err, updatedActa) {
            if (err) {
              return res.status(500).json({ error: "There was an unexpected problem updating the acta" });
            }
            res.status(200).json(updatedActa);
          });
      }
    }
    catch (error) {
      return res.status(500).json({ error: "There was an unexpected problem updating the acta" });
    }
  }

  static delete_get(req, res, next) {
    res.status(200).json({ id: req.params.id });
  }

  static async delete_post(req, res, next) {
    Acta.findByIdAndRemove(req.params.id, function (error) {
      if (error) {
        return res.status(500).json({ error: "There was an unexpected problem deleting the acta" });
      } else {
        res.status(200).json({ message: 'Acta deleted successfully' });
      }
    });
  }
}

module.exports = ActaController;
