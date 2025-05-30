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



exports.updateMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ success: false, msg: "Tens de ter um token para aceder a esta rota." });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Não tens permissão para aceder a esta rota." });
    }

    const id = req.params.id;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, msg: "Por favor preenche o campo 'message'." });
    }

    const msgObj = await PresetMessages.findById(id).exec();
    if (!msgObj) {
      return res.status(404).json({ success: false, msg: "Mensagem não encontrada." });
    }

    msgObj.message = message;
    await msgObj.save();
    return res.status(200).json({ success: true, msg: "Mensagem atualizada com sucesso!", message: msgObj });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Algum erro ocorreu ao atualizar a mensagem." });
  }
};


exports.deleteMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ success: false, msg: "Tens de ter um token para aceder a esta rota." });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, msg: "Não tens permissão para aceder a esta rota." });
    }

    const id = req.params.id;
    const msgObj = await PresetMessages.findById(id).exec();
    if (!msgObj) {
      return res.status(404).json({ success: false, msg: "Mensagem não encontrada." });
    }

    await msgObj.deleteOne();
    return res.status(200).json({ success: true, msg: "Mensagem eliminada com sucesso!" });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message || "Algum erro ocorreu ao eliminar a mensagem." });
  }
};
