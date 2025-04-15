const db = require("../models");
const FormAnswers = db.formAnswers;
const Form = db.form;

exports.getAnswers = async (req, res) => {
  try {
    if (req.user) {
      let query = {};
      if (req.user.role === "user") {
        let loggedUser = await User.findOne({ _id: req.user.id }).exec();

        const allowedIds = [loggedUser.id];

        if (!requestedUserId || !allowedIds.includes(requestedUserId)) {
          return res.status(403).json({
            success: false,
            msg: "Não tens permissão para ver as respostas deste utilizador.",
          });
        }

        query.userId = requestedUserId;
      }

      if (req.user.role === "admin" && req.query.userId) {
        query.userId = req.query.userId;
      }

      let answers = await FormAnswers.find(query).exec();

      res.status(200).json({ success: true, answers });
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

exports.fillForm = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Dados inválidos. Envie respostas válidas.",
      });
    }

    for (const item of answers) {
      const questionId = item.question;

      const questionExists = await Form.findOne({
        _id: questionId,
        active: true,
      });

      if (!questionExists) {
        return res.status(400).json({
          success: false,
          msg: `A pergunta com ID ${questionId} não existe ou está inativa.`,
        });
      }
    }

    const formAnswer = await FormAnswers.create({
      userId: req.user.id,
      date: getFormattedDate(),
      answers,
    });

    return res.status(201).json({
      success: true,
      msg: "Formulário preenchido com sucesso!",
      formAnswer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao preencher o formulário.",
    });
  }
};

function getFormattedDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
