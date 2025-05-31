module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: {
        type: String,
        allowNull: false,
      },
      type: {
        type: String,
        enum: [
          "Backgrounds",
          "Shirts",
          "SkinColor",
          "Bigode",
          "Cachecol",
          "Chapeu",
          "Ouvidos",
          "Oculos",
        ],
        allowNull: false,
      },
      value: { type: Number, allowNull: false },
      src: { type: String, allowNull: false },
      left: Number,
      bottom: Number,
      width: Number,
    },
    { timestamps: false }
  );
  const Accessories = mongoose.model("Accessory", schema);
  return Accessories;
};
