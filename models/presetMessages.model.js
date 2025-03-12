module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      message: {
        type: String,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  const PresetMessage = mongoose.model("presetMessages", schema);
  return PresetMessage;
};
