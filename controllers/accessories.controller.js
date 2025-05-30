const db = require("../models");
const Accessories = db.accessories;
const User = db.users;

const allowedTypes = [
  "Backgrounds",
  "Shirts",
  "SkinColor",
  "Bigode",
  "Cachecol",
  "Chapeu",
  "Ouvidos",
];

exports.getAccessories = async (req, res) => {
  try {
    const allowedTypes = [
      "Backgrounds",
      "Shirts",
      "SkinColor",
      "Bigode",
      "Cachecol",
      "Chapeu",
      "Ouvidos",
    ];
    let query = {};

    if (req.query.type) {
      if (!allowedTypes.includes(req.query.type)) {
        return res.status(400).json({
          success: false,
          msg: `Tipos inválidos. Os tipos válidos são: ${allowedTypes.join(
            ", "
          )}`,
        });
      }
      query.type = req.query.type;
    }

    let accessories = await Accessories.find(query).exec();

    res.status(200).json({ success: true, accessories });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao encontrar os acessórios.",
    });
  }
};

exports.addAccessory = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        msg: req.user
          ? "Não tens permissão para aceder a esta rota."
          : "Tens de ter um token para aceder a esta rota.",
      });
    }

    const { name, type, value, src } = req.body;

    if (!name || !type || !value || !src) {
      return res.status(400).json({
        success: false,
        msg: "Por favor preenche todos os campos obrigatórios: name, type, value e src.",
      });
    }
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        msg: `Tipo inválido. Tipos válidos: ${allowedTypes.join(", ")}`,
      });
    }

    const newAccessory = await Accessories.create({ name, type, value, src });
    return res.status(201).json({
      success: true,
      msg: "Acessório criado com sucesso!",
      accessory: newAccessory,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao criar o acessório.",
    });
  }
};

exports.updateAccessory = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        msg: req.user
          ? "Não tens permissão para aceder a esta rota."
          : "Tens de ter um token para aceder a esta rota.",
      });
    }

    const accId = req.params.id;
    const { name, type, value, src } = req.body;

    // validação dos campos
    if (!name || !type || !value || !src) {
      return res.status(400).json({
        success: false,
        msg: "Por favor preenche todos os campos obrigatórios: name, type, value e src.",
      });
    }
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        msg: `Tipo inválido. Tipos válidos: ${allowedTypes.join(", ")}`,
      });
    }

    const accessory = await Accessories.findById(accId).exec();
    if (!accessory) {
      return res.status(404).json({
        success: false,
        msg: "Acessório não encontrado.",
      });
    }

    accessory.name = name;
    accessory.type = type;
    accessory.value = value;
    accessory.src = src;
    await accessory.save();

    return res.status(200).json({
      success: true,
      msg: "Acessório atualizado com sucesso!",
      accessory,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message || "Algum erro ocorreu ao editar o acessório.",
    });
  }
};

exports.deleteAccessory = async (req, res) => {
  try {

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        msg: req.user
          ? 'Não tens permissão para aceder a esta rota.'
          : 'Tens de ter um token para aceder a esta rota.',
      });
    }

    const accId = req.params.id;
    const accessory = await Accessories.findById(accId).exec();
    if (!accessory) {
      return res.status(404).json({
        success: false,
        msg: 'Acessório não encontrado.',
      });
    }

    const value = accessory.value || 0;


    const equipSlots = [
      'hat',        // chapéu (Chapeu)
      'shirt',      // camisola (Shirts)
      'background', // fundo (Backgrounds)
      'bigode',     // mustache (Bigode)
      'cachecol',   // scarf (Cachecol)
      'ouvidos',    // ears (Ouvidos)
    ];


    const users = await User.find({
      $or: [
        { accessoriesOwned: accId },
        ...equipSlots.map(slot => ({ [`accessoriesEquipped.${slot}`]: accId })),
      ],
    });

   
    for (const u of users) {
 
      u.accessoriesOwned = u.accessoriesOwned.filter(
        oid => oid.toString() !== accId
      );

  
      for (const slot of equipSlots) {
        if (u.accessoriesEquipped[slot]?.toString() === accId) {
          u.accessoriesEquipped[slot] = null;
        }
      }

      // devolve os pontos do acessório apagado
      u.points = (u.points || 0) + value;
      await u.save();
    }

    // finalmente, apaga o acessório
    await accessory.deleteOne();

    return res.status(200).json({
      success: true,
      msg: `Acessório apagado com sucesso. ${users.length} utilizador(es) atualizado(s).`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      msg: err.message || 'Algum erro ocorreu ao apagar o acessório.',
    });
  }
};


exports.findAll = async (req, res) => {
  try {
    let accessories = await Accessories.find().exec();
    res.status(200).json({ success: true, accessories: accessories });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Ocorreu algum erro a encontrar os acessórios.",
    });
  }
};

exports.getAccessoriesStats = async (req, res) => {
  try {
    const totalAccessories = await Accessories.countDocuments();
    return res.status(200).json({ totalAccessories });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao obter as estatísticas dos acessórios.",
      error,
    });
  }
};
