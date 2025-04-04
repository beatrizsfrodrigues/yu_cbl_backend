module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      message: {
        type: String,
        allowNull: false,
        required: true,
      },
    },
    { timestamps: false }
  );
  const PresetMessage = mongoose.model("preset-messages", schema);
  return PresetMessage;
};
