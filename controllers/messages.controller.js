const db = require("../models");
const Message = db.messages;
const User = db.users;

// [2] Adiciona mensagem a uma conversa existente
exports.sendMessage = async (req, res) => {
  try {
    if (req.user) {
      const { id } = req.params;

      let loggedUser = await User.findOne({ _id: req.user.id }).exec();

      const { message } = req.body;

      const conversation = await Message.findById(id);

      if (!conversation) {
        return res
          .status(404)
          .json({ success: false, message: "Conversa não encontrada." });
      }

      if (
        conversation.usersId[0].toString() !== loggedUser._id.toString() &&
        conversation.usersId[1].toString() !== loggedUser._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Não tens permissão para enviar mensagens nesta conversa.",
        });
      }

      if (
        conversation.usersId[0].toString() !==
          loggedUser.partnerId.toString() &&
        conversation.usersId[1].toString() !== loggedUser.partnerId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Estás a enviar mensagem para o utilizador errado.",
        });
      }

      // Adiciona a nova mensagem
      conversation.messages.push({
        senderId: loggedUser._id,
        receiverId: loggedUser.partnerId,
        senderType: "user",
        message,
      });

      await conversation.save();

      return res.status(201).json({
        success: true,
        msg: "Mensagem enviada com sucesso!",
        conversation,
      });
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao enviar mensagem.",
    });
  }
};

// [3] Retorna uma conversa pelo ID
exports.getChat = async (req, res) => {
  try {
    if (req.user) {
      const { id } = req.params;

      let loggedUser = await User.findOne({ _id: req.user.id }).exec();

      const chat = await Message.findById(id);

      if (!chat) {
        return res
          .status(404)
          .json({ success: false, message: "Conversa não encontrada." });
      }

      if (
        chat.usersId[0].toString() !== loggedUser._id.toString() &&
        chat.usersId[1].toString() !== loggedUser._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Não tens permissão para ver esta conversa.",
        });
      }

      // return res.json(chat);

      return res.status(200).json({
        success: true,
        chat,
      });
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao encontrar a conversa.",
    });
  }
};

// [4] Retorna todas as conversas de um user
exports.getChatByUser = async (req, res) => {
  try {
    if (req.user) {
      const { userId } = req.params;

      let loggedUser = await User.findOne({ _id: req.user.id }).exec();

      const chat = await Message.findOne({
        usersId: userId,
      });

      if (!chat) {
        return res
          .status(404)
          .json({ success: false, message: "Conversa não encontrada." });
      }

      if (
        chat.usersId[0].toString() !== userId.toString() &&
        chat.usersId[1].toString() !== userId.toString() &&
        loggedUser._id.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Não tens permissão para ver esta conversa.",
        });
      }

      return res.status(200).json({
        success: true,
        chat,
      });
    } else {
      return res.status(403).json({
        success: false,
        msg: "Tens de ter um token para aceder a esta rota.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao encontrar a conversa.",
    });
  }
};

// [1] Cria uma conversa vazia
exports.createConversation = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.body;

    // Verifica se já existe conversa com estes 2 utilizadores
    const existing = await Message.findOne({
      usersId: { $all: [user1Id, user2Id] },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Já existe uma conversa entre estes utilizadores." });
    }

    const conversation = await Message.create({
      usersId: [user1Id, user2Id],
      messages: [],
    });

    return res.status(201).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
