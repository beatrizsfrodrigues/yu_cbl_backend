// controllers/userController.js

const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const User = require("../models/userModel");
const config = require("../config/db.config.js");
const User = db.users;

const Messages = db.messages;
const Accessory = db.accessories;

exports.findAll = async (req, res) => {
  try {
    let users = await User.find().exec();
    res.status(200).json({ success: true, users });
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

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "O email já está em uso." });
    }
    if (await User.findOne({ username })) {
      return res
        .status(400)
        .json({ message: "O nome de utilizador já está em uso." });
    }

    const generateRandomCode = (length) => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(
          Math.floor(Math.random() * chars.length)
        );
      }
      return result;
    };


    const newUser = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, 10),
      code: generateRandomCode(5),
      role: "user",
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      config.SECRET,
      { expiresIn: "24h" }
    );


    return res.status(201).json({
      message: "Utilizador registado com sucesso!",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Erro no createUser:", error);
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
    }).populate("accessoriesOwned");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, msg: "Email ou nome de utilizador está incorreto." });
    }

   
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        msg: "Credenciais inválidas.",
      });
    }

   
    const { password: _password, ...userWithoutPassword } = user.toObject();


    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.SECRET,
      { expiresIn: "24h" }
    );


    return res.status(200).json({
      success: true,
      message: "Login efetuado com sucesso!",
      token,                
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Ocorreu um erro ao efetuar login.", error });
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
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.connectPartner = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Utilizador não autenticado." });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "É necessário informar o code." });
    }

    const partnerUser = await User.findOne({ code });
    if (!partnerUser) {
      return res
        .status(404)
        .json({ message: "Nenhum Utilizador encontrado com esse code." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Utilizador logado não encontrado." });
    }

    if (user.partnerId || partnerUser.partnerId) {
      return res.status(400).json({
        message: "Um dos utilizadores já tem parceiro atribuído.",
      });
    }

    user.partnerId = partnerUser._id;
    partnerUser.partnerId = user._id;
    await user.save();
    await partnerUser.save();

    const existingConversation = await Messages.findOne({
      usersId: { $all: [user._id, partnerUser._id] },
    });
    if (!existingConversation) {
      await Messages.create({
        usersId: [user._id, partnerUser._id],
        messages: [],
      });
    }

    return res.json({
      message:
        "Partner conectado com sucesso. Conversa criada (caso não existisse).",
      user,
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
      return res.status(401).json({ message: "Utilizador não autenticado." });
    }
    if (!loggedUser.partnerId) {
      return res
        .status(404)
        .json({ message: "Nenhum parceiro conectado ao Utilizador logado." });
    }
    const partnerUser = await User.findById(loggedUser.partnerId);
    if (!partnerUser) {
      return res
        .status(404)
        .json({ message: "Utilizador parceiro não encontrado." });
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
      return res.status(401).json({ message: "Utilizador não autenticado." });
    }
    return res.json(loggedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserAccessories = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Utilizador não autenticado." });
    }
    const user = await User.findById(req.user.id).populate("accessoriesOwned");
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }
    return res.json(user.accessoriesOwned);
  } catch (error) {
    console.error("Erro ao procurar acessórios:", error);
    return res
      .status(500)
      .json({ message: "Erro ao buscar acessórios", error });
  }
};

exports.buyAccessory = async (req, res) => {
  try {
    const { accessoryId } = req.body;
    if (!accessoryId) {
      return res
        .status(400)
        .json({ message: "O ID do acessório é obrigatório." });
    }

    const accessory = await Accessory.findById(accessoryId);
    if (!accessory) {
      return res.status(404).json({ message: "Acessório não encontrado." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    if (user.points < accessory.value) {
      return res.status(400).json({
        message: "Estrelas insuficientes para comprar este acessório.",
      });
    }

    user.accessoriesOwned = user.accessoriesOwned || [];
    if (user.accessoriesOwned.includes(accessoryId)) {
      return res.status(400).json({ message: "Acessório já adquirido." });
    }

    user.points -= accessory.value;
    user.accessoriesOwned.push(accessoryId);
    await user.save();

    await user.populate("accessoriesOwned");

    return res.json({
      message: "Acessório adquirido com sucesso.",
      accessories: user.accessoriesOwned,
      points: user.points,
    });
  } catch (error) {
    console.error("Erro ao adquirir acessório:", error);
    return res
      .status(500)
      .json({ message: "Erro ao adquirir acessório", error });
  }
};

// para vestir os coisos
exports.equipAccessory = async (req, res) => {
  try {
    const { accessoryId, type } = req.body;
    if (!type) {
      return res
        .status(400)
        .json({ message: "O tipo de acessório é obrigatório." });
    }

    const slotMap = {
      Backgrounds: "background",
      Shirts: "shirt",
      Bigode: "bigode",
      Cachecol: "cachecol",
      Chapeu: "chapeu",
      Ouvidos: "ouvidos",
      Oculos: "oculos",
    };

    const slot = slotMap[type];
    if (!slot) {
      return res
        .status(400)
        .json({ message: "Tipo de acessório inválido para equipar." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    if (slot !== "color") {
      if (accessoryId !== null) {
        const accessory = await Accessory.findById(accessoryId);
        if (!accessory) {
          return res.status(404).json({ message: "Acessório não encontrado." });
        }
        const owns = user.accessoriesOwned
          .map((id) => id.toString())
          .includes(accessoryId);
        if (!owns) {
          return res.status(400).json({ message: "Acessório não adquirido." });
        }
        user.accessoriesEquipped[slot] = accessory._id;
      } else {
        user.accessoriesEquipped[slot] = null;
      }
    } else {
      if (accessoryId !== null) {
        user.accessoriesEquipped.color = accessoryId;
      } else {
        user.accessoriesEquipped.color = 0;
      }
    }

    await user.save();
    return res.status(200).json({
      message: "Acessório atualizado com sucesso.",
      accessoriesEquipped: user.accessoriesEquipped,
    });
  } catch (error) {
    console.error("Erro ao equipar/desquipar acessório:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao atualizar acessório." });
  }
};

exports.getEquippedAccessories = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("accessoriesEquipped.background")
      .populate("accessoriesEquipped.shirt")
      .populate("accessoriesEquipped.bigode")
      .populate("accessoriesEquipped.cachecol")
      .populate("accessoriesEquipped.chapeu")
      .populate("accessoriesEquipped.ouvidos")
      .populate("accessoriesEquipped.oculos");

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    const formatAccessory = (acc) =>
      acc
        ? {
            id: acc._id,
            name: acc.name,
            type: acc.type,
            value: acc.value,
            src: acc.src,
          }
        : null;

    return res.status(200).json({
      background: formatAccessory(user.accessoriesEquipped.background),
      shirt: formatAccessory(user.accessoriesEquipped.shirt),
      bigode: formatAccessory(user.accessoriesEquipped.bigode),
      cachecol: formatAccessory(user.accessoriesEquipped.cachecol),
      chapeu: formatAccessory(user.accessoriesEquipped.chapeu),
      ouvidos: formatAccessory(user.accessoriesEquipped.ouvidos),
      oculos: formatAccessory(user.accessoriesEquipped.oculos),
    });
  } catch (err) {
    console.error("Erro ao buscar acessórios equipados:", err);
    return res.status(500).json({
      message: "Erro ao buscar acessórios equipados.",
      error: err.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findByIdAndDelete(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }
    return res
      .status(200)
      .json({ message: "Utilizador eliminado com sucesso." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao eliminar o utilizador.", error });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    return res.status(200).json({ totalUsers });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Erro ao obter as estatísticas.", error });
  }
};
