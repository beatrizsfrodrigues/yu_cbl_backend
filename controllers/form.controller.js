const db = require("../models");
const Form = db.form;

exports.getForm = async (req, res) => {
  try {
    let query = {};

    let questions = await Form.find().exec();

    res.status(200).json({ success: true, questions });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao encontrar o formulário.",
    });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    let query = {};

    if (req.user) {
      if (req.user.role == "admin") {
        const { question, answers } = req.body;

        if (!question || !answers) {
          return res.status(400).json({
            success: false,
            msg: "Por favor preenche todos os campos obrigatórios.",
          });
        }

        const newQuestion = await Form.create({
          question,
          answers,
        });

        return res.status(201).json({
          success: true,
          msg: "Pergunta criada com sucesso!",
          question: newQuestion,
        });
      } else {
        return res.status(403).json({
          success: false,
          msg: "Não tens permissão para aceder a esta rota.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg:
        err.message ||
        "Algum erro ocorreu ao adicionar uma pergunta ao formulário.",
    });
  }
};

exports.activeQuestion = async (req, res) => {
  try {
    if (req.user) {
      if (req.user.role == "admin") {
        const qId = req.params.id;

        let question = await Form.findOne({ _id: qId }).exec();

        if (!question) {
          return res.status(404).json({
            success: false,
            msg: "Pergunta não encontrada.",
          });
        }
        question.active = !question.active;

        await question.save();

        return res.status(200).json({
          success: true,
          msg: "Estado da pergunta trocado com sucesso!",
          question,
        });
      } else {
        return res.status(403).json({
          success: false,
          msg: "Não tens permissão para aceder a esta rota.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao encontrar o formulário.",
    });
  }
};
