
const db = require("../models");
const Accessory = db.accessories;



exports.findAll = async (req, res) => {
    try {
      let accessories = await Accessory.find().exec();
      res.status(200).json({ success: true, accessories: accessories });
    } catch (err) {
      res.status(500).json({
        success: false,
        msg: err.message || "Ocorreu algum erro a encontrar os acessórios.",
      });
    }
};


exports.getAccessoriesStats = async (req, res) => {
  try {
    const totalAccessories = await Accessory.countDocuments();
    return res.status(200).json({ totalAccessories });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter as estatísticas dos acessórios.", error });
  }
};