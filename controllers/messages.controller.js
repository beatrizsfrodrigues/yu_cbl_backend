
const Messages = require('../models/messages.model');

// [1] Cria uma conversa vazia 
exports.createConversation = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.body;

    // Verifica se já existe conversa com estes 2 utilizadores
    const existing = await Messages.findOne({
      usersId: { $all: [user1Id, user2Id] }
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'Já existe uma conversa entre estes usuários.' });
    }

    const conversation = await Messages.create({
      usersId: [user1Id, user2Id],
      messages: []
    });

    return res.status(201).json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// [2] Adiciona mensagem a uma conversa existente
exports.addMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, receiverId, message } = req.body;

    const conversation = await Messages.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversa não encontrada.' });
    }

    // Adiciona a nova mensagem
    conversation.messages.push({
      senderId,
      receiverId,
      message
    });

    await conversation.save();
    return res.json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// [3] Retorna uma conversa pelo ID
exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Messages.findById(conversationId)
      .populate('usersId', 'username email')
      .populate('messages.senderId', 'username email')
      .populate('messages.receiverId', 'username email');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversa não encontrada.' });
    }

    return res.json(conversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// [4] Retorna todas as conversas de um user
exports.getConversationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Messages.find({
      usersId: userId
    })
      .populate('usersId', 'username email')
      .populate('messages.senderId', 'username email')
      .populate('messages.receiverId', 'username email');

    return res.json(conversations);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
