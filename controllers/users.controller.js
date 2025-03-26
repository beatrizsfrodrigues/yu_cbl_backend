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
      return res.status(400).json({ message: "O email já está em uso." });
    }

    const newUser = await User.create({
      username,
      email,
      password: bcrypt.hashSync(req.body.password, 10),
      code: "olaa",
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

    if (!req.body || !emailOrUsername || !password)
      return res.status(400).json({
        success: false,
        msg: "Por favor preencha todos os campos obrigatórios.",
      });

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou nome de utilizador incorreto." });
    }

    const check = bcrypt.compareSync(password, user.password);
    if (!check)
      return res.status(401).json({
        success: false,
        accessToken: null,
        msg: "Credenciais invalidas.",
      });

    const token = jwt.sign({ id: user.id }, config.SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({
      message: "Login efetuado com sucesso!",
      user: user,
      token,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Ocorreu um erro ao efetuar login.", error });
  }
};
