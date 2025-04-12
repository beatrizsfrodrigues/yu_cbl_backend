const db = require("../models");
const PresetMessages = db.presetMessages;

exports.getMessages = async (req, res) => {
  try {
    let messages = await PresetMessages.find().exec();

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg:
        err.message ||
        "Algum erro ocorreu ao encontrar as mensagens predefinidas.",
    });
  }
};

exports.createMessage = async (req, res) => {
  try {
    if (req.user) {
      if (req.user.role == "admin") {
        const { message } = req.body;

        if (!message) {
          return res.status(400).json({
            success: false,
            msg: "Por favor preenche todos os campos obrigatórios.",
          });
        }

        const newMessage = await PresetMessages.create({
          message,
        });

        return res.status(201).json({
          success: true,
          msg: "Mensagem criada com sucesso!",
          message: newMessage,
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
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao criar a tarefa.",
    });
  }
};
