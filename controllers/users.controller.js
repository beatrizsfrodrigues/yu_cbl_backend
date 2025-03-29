const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const User = require("../models/userModel");
const config = require("../config/db.config.js");
const User = db.users;

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
        .json({ message: "Por favor preencha todos os campos obrigatórios." });
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
        msg: "Por favor preencha todos os campos obrigatórios.",
      });
    }

    // Busca Utilizador por email ou username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou nome de utilizador incorreto." });
    }

    // Verifica senha
    const check = bcrypt.compareSync(password, user.password);
    if (!check) {
      return res.status(401).json({
        success: false,
        accessToken: null,
        msg: "Credenciais inválidas.",
      });
    }

    const token = jwt.sign({ id: user._id }, config.SECRET, { expiresIn: '24h' });


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

// [2] Atualizar Utilizador pelo ID
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Utilizador não autenticado' });
    }
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'É necessário informar o code.' });
    }

    const partnerUser = await User.findOne({ code });
    if (!partnerUser) {
      return res.status(404).json({ message: 'Nenhum Utilizador encontrado com esse code.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizador logado não encontrado.' });
    }

    user.partnerId = partnerUser._id;
    const updatedUser = await user.save();

    return res.json({
      message: 'Partner conectado com sucesso.',
      user: updatedUser
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
