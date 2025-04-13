const db = require("../models");
const Form = db.form;

exports.getAnswers = async (req, res) => {
  try {
    let query = {};

    let questions = await Form.findAll().exec();

    res.status(200).json({ success: true, questions });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao encontrar o formulário.",
    });
  }
};

exports.fillForm = async (req, res) => {
  try {
    let query = {};

    let questions = await Form.findAll().exec();

    res.status(200).json({ success: true, questions });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao encontrar o formulário.",
    });
  }
};
