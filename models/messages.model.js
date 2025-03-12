module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      usersId: {
        type: Array,
        allowNull: false,
        required: true,
      },
      messages: {
        type: Object,
        allowNull: false,
        required: true,
      },
    },
    { timestamps: false }
  );
  const Message = mongoose.model("messages", schema);
  return Message;
};
