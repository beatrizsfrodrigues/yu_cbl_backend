const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const User = require("../models/userModel");
const config = require("../config/db.config.js");
const User = db.users;
const Messages = require('../models/messages.model');
const Accessory = db.accessories;


exports.findAll = async (req, res) => {
  try {
    let users = await User.find().exec();
    res.status(200).json({ success: true, users: users });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Ocorreu algum erro a encontrar os utilizadores.",
    });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Por favor preenche todos os campos obrigatórios." });
    }

    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res.status(400).json({ message: "O email já está em uso." });
    }

    const userUsername = await User.findOne({ username });
    if (userUsername) {
      return res.status(400).json({ message: "O nome de utilizador já está em uso." });
    }

   
    const generateRandomCode = (length) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newUser = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      code: generateRandomCode(5),
      role: 'user' 
    });

    return res.status(201).json({
      message: "Utilizador registado com sucesso!",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro ao registar o utilizador.", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        msg: "Por favor preenche todos os campos obrigatórios.",
      });
    }

    
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou nome de utilizador está incorreto." });
    }

 
    const check = bcrypt.compareSync(password, user.password);
    if (!check) {
      return res.status(401).json({
        success: false,
        accessToken: null,
        msg: "Credenciais inválidas.",
      });
    }

    
    const token = jwt.sign({ id: user._id, role: user.role }, config.SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      message: "Login efetuado com sucesso!",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro ao efetuar login.", error });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Nenhum dado para atualizar." });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }


    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.connectPartner = async (req, res) => {
  try {
    // Verifica se o utilizador está autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilizador não autenticado' });
    }

    // Verifica se o código foi fornecido
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'É necessário informar o código.' });
    }

    // Procura o parceiro com o código fornecido
    const partnerUser = await User.findOne({ code });
    if (!partnerUser) {
      return res.status(404).json({ message: 'Nenhum utilizador encontrado com esse código.' });
    }

    // Procura o utilizador autenticado
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizador logado não encontrado.' });
    }

    // Verifica se algum dos utilizadores já tem parceiro
    if (user.partnerId || partnerUser.partnerId) {
      return res.status(400).json({ message: 'Um dos utilizadores já tem parceiro atribuído.' });
    }

    // Atribui o parceiro a ambos os utilizadores
    user.partnerId = partnerUser._id;
    partnerUser.partnerId = user._id;

    await user.save();
    await partnerUser.save();

    // Verifica se já existe conversa entre os dois utilizadores
    const existingConversation = await Messages.findOne({
      usersId: { $all: [user._id, partnerUser._id] }
    });

    // Se não existir, cria uma nova conversa
    if (!existingConversation) {
      await Messages.create({
        usersId: [user._id, partnerUser._id],
        messages: []
      });
    }

    return res.json({
      message: 'Parceiro conectado com sucesso. Conversa criada (caso não existisse).',
      user
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


exports.getPartner = async (req, res) => {
  try {
    const loggedUser = await User.findById(req.user.id);
    if (!loggedUser) {
      return res.status(401).json({ message: "Utilizador não autenticado" });
    }

    if (!loggedUser.partnerId) {
      return res
        .status(404)
        .json({ message: "Nenhum parceiro conectado ao Utilizador logado" });
    }

    const partnerUser = await User.findById(loggedUser.partnerId);
    if (!partnerUser) {
      return res.status(404).json({ message: "Utilizador parceiro não encontrado" });
    }

    return res.json(partnerUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getLoggedInUser = async (req, res) => {
  try {
    const loggedUser = await User.findById(req.user.id);
    if (!loggedUser) {
      return res.status(401).json({ message: "Utilizador não autenticado" });
    }
    return res.json(loggedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getUserAccessories = async (req, res) => {
  try {
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilizador não autenticado' });
    }

    const user = await User.findById(req.user.id).populate('accessoriesOwned');


    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.json(user.accessoriesOwned);
  } catch (error) {
    console.error("Erro ao buscar acessórios:", error);
    return res.status(500).json({ message: "Erro ao buscar acessórios", error });
  }
};
exports.buyAccessory = async (req, res) => {
  try {
    const { accessoryId } = req.body;
    if (!accessoryId) {
      return res.status(400).json({ message: "O ID do acessório é obrigatório." });
    }

    const accessory = await Accessory.findById(accessoryId);
    if (!accessory) {
      return res.status(404).json({ message: "Acessório não encontrado." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    if (!user.accessoriesOwned) {
      user.accessoriesOwned = [];
    }
    if (user.accessoriesOwned.includes(accessoryId)) {
      return res.status(400).json({ message: "Acessório já adquirido." });
    }

    user.accessoriesOwned.push(accessoryId);
    await user.save();
    await user.populate('accessoriesOwned');

    return res.json({ message: "Acessório adquirido com sucesso.", accessories: user.accessoriesOwned });
  } catch (error) {
    console.error("Erro ao adquirir acessório:", error);
    return res.status(500).json({ message: "Erro ao adquirir acessório", error });
  }
};



exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findByIdAndDelete(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }
    return res.status(200).json({ message: "Utilizador eliminado com sucesso." });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao eliminar o utilizador.", error });
  }
};


exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    return res.status(200).json({ totalUsers });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter as estatísticas.", error });
  }
};