module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      usersId: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      messages: [
        {
          senderId: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
          },
          receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          message: {
            type: String,
            required: true,
          },
          date: {
            type: Number,
            required: true,
            default: getFormattedDate,
          },
        },
      ],
    },
    { timestamps: false }
  );

  schema.path("usersId").validate(function (value) {
    return value.length === 2;
  }, "usersId must contain exactly 2 users.");
  const Message = mongoose.model("Messages", schema);
  return Message;
};

function getFormattedDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
