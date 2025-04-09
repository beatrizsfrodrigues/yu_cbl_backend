const db = require("../models");
const Accessories = db.accessories;
const User = db.users;

exports.getAccessories = async (req, res) => {
  try {
    const allowedTypes = ["Decor", "Shirts", "Backgrounds", "SkinColor"];
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
    if (req.user) {
      if (req.user.role == "admin") {
        const { name, type, value, src, left, bottom, width } = req.body;

        if (!name || !type || !value || !src || !left || !bottom || !width) {
          return res.status(400).json({
            success: false,
            msg: "Por favor preenche todos os campos obrigatórios.",
          });
        }

        const newAccessory = await Accessories.create({
          name,
          type,
          value,
          src,
          left,
          bottom,
          width,
        });

        return res.status(201).json({
          success: true,
          msg: "Acessório criado com sucesso!",
          accessory: newAccessory,
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
      msg: err.message || "Algum erro ocorreu ao criar o acessório.",
    });
  }
};

exports.deleteAccessory = async (req, res) => {
  try {
    if (req.user) {
      if (req.user.role == "admin") {
        const accId = req.params.id;

        const accessory = await Accessories.findById(accId).exec();

        if (!accessory) {
          return res.status(404).json({
            success: false,
            msg: "Acessório não encontrada.",
          });
        }

        const value = accessory.value || 0;

        const users = await User.find({
          $or: [
            { accessoriesOwned: accId },
            {
              $or: [
                { "accessoriesEquipped.hat": accId },
                { "accessoriesEquipped.shirt": accId },
                { "accessoriesEquipped.color": accId },
                { "accessoriesEquipped.background": accId },
              ],
            },
          ],
        });

        for (const user of users) {
          user.accessoriesOwned = user.accessoriesOwned.filter(
            (ownedId) => String(ownedId) !== String(accId)
          );

          for (let key of ["hat", "shirt", "color", "background"]) {
            if (String(user.accessoriesEquipped[key]) === String(accId)) {
              user.accessoriesEquipped[key] = null;
            }
          }

          user.points += value;

          await user.save();
        }

        await accessory.deleteOne();

        return res.status(200).json({
          success: true,
          msg: `Acessório apagado com sucesso. ${users.length} utilizadores atualizados.`,
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
      msg: err.message || "Algum erro ocorreu ao apagar o acessório.",
    });
  }
};
