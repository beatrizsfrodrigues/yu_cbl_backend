const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      code: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      username: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      email: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      password: {
        type: String,
        trim: true,
        allowNull: false,
        required: true,
      },
      points: {
        type: Number,
        default: 0,
      },
      role: {
        type: String,
        default: "user",
      },
      partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      accessoriesOwned: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Accessory" }],
        default: [],
      },
      accessoriesEquipped: {
        background: {
          type: Schema.Types.ObjectId,
          ref: "Accessory",
          default: null,
        },
        shirt: { type: Schema.Types.ObjectId, ref: "Accessory", default: null },
        bigode: {
          type: Schema.Types.ObjectId,
          ref: "Accessory",
          default: null,
        },
        cachecol: {
          type: Schema.Types.ObjectId,
          ref: "Accessory",
          default: null,
        },
        chapeu: {
          type: Schema.Types.ObjectId,
          ref: "Accessory",
          default: null,
        },
        ouvidos: {
          type: Schema.Types.ObjectId,
          ref: "Accessory",
          default: null,
        },
        oculos: {
          type: Schema.Types.ObjectId,
          ref: "Accessory",
          default: null,
        },


      },

      mascot: {
        type: String,
        default:
          "https://res.cloudinary.com/dinzra2oo/image/upload/v1748611193/YU-119_weajgx.svg",
      },
    },
    { timestamps: false }
  );
  const User = mongoose.model("User", schema);
  return User;
};
