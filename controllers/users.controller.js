const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const User = require("../models/userModel");
const User = db.users;

exports.findAll = async (req, res) => {
  try {
    let users = await User.find().exec();
    res.status(200).json({ success: true, users: users });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while retrieving all users.",
    });
  }
};

// const registerUser = async (req, res) => {
//   try {
//     const { username, email, password, age } = req.body;

//     if (!username || !email || !password || !age) {
//       //sao os campos que tem que preencher no registo
//       return res
//         .status(400)
//         .json({ message: "Por favor preencha todos os campos obrigatórios." });
//     }
//     const userExist = await User.findOne({ email });
//     if (userExist) {
//       return res.status(400).json({ message: "O email já está em uso." });
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//       age,
//       // points = 0 (default)
//       // code = "" (default)
//       // partnerId = null (default)
//       // tasks = [] (default)
//     });

//     const token = jwt.sign(
//       { userId: newUser._id },
//       process.env.JWT_SECRET || "chaveSecreta",
//       {
//         expiresIn: "1d",
//       }
//     );

//     return res.status(201).json({
//       message: "Utilizador registado com sucesso!",
//       user: {
//         _id: newUser._id,
//         username: newUser.username,
//         email: newUser.email,
//         points: newUser.points,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "Ocorreu um erro ao registar o utilizador.", error });
//   }
// };
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "Preencha email e password." });
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Email ou password incorretos." });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Email ou password incorretos." });
//     }

//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET || "chaveSecreta",
//       {
//         expiresIn: "1d",
//       }
//     );

//     return res.status(200).json({
//       message: "Login efetuado com sucesso!",
//       user: {
//         _id: user._id,
//         username: user.username,
//         email: user.email,
//         points: user.points,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "Ocorreu um erro ao efetuar login.", error });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
// };
