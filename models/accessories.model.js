module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: {
        type: String,
        allowNull: false,
      },
      type: {
        type: String,
        enum: ["Decor", "Shirts", "Backgrounds", "SkinColor"],
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
  const Accessories = mongoose.model("accessories", schema);
  return Accessories;
};
