const db = require("../models");
const Message = db.messages;
const User = db.users;

// [2] Adiciona mensagem a uma conversa existente
// ! so os users da conversa podem mandar msg pra conversa
// ! adicionar mais erros
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;

    let loggedUser = await User.findOne({ _id: req.user.id }).exec();

    const { message } = req.body;

    const conversation = await Message.findById(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversa não encontrada." });
    }

    // Adiciona a nova mensagem
    conversation.messages.push({
      senderId: loggedUser._id,
      receiverId: loggedUser.partnerId,
      message,
    });

    await conversation.save();
    return res.json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// [3] Retorna uma conversa pelo ID
// ! so os users da conversa podem aceder a ela
// ! adicionar mais erros
exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Message.findById(id);
    // .populate("usersId", "username email")
    // .populate("messages.senderId", "username email")
    // .populate("messages.receiverId", "username email");

    if (!conversation) {
      return res.status(404).json({ message: "Conversa não encontrada." });
    }

    return res.json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// [4] Retorna todas as conversas de um user
// ! so os users da conversa podem aceder a ela
// ! adicionar mais erros
exports.getConversationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Message.find({
      usersId: userId,
    });
    // .populate("usersId", "username email")
    // .populate("messages.senderId", "username email")
    // .populate("messages.receiverId", "username email");

    return res.json(conversations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
        .json({ message: "Já existe uma conversa entre estes usuários." });
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
