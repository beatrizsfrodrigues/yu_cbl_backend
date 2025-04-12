module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        allowNull: false,
      },
      title: {
        type: String,
        allowNull: false,
        required: true,
      },
      description: {
        type: String,
        allowNull: false,
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
        allowNull: false,
      },
      completedDate: {
        type: Number,
        default: 0,
      },
      picture: {
        type: String,
        default: "",
      },
      verified: {
        type: Boolean,
        default: false,
        allowNull: false,
      },
      rejectMessage: {
        type: String,
        default: "",
      },
      notification: {
        type: Boolean,
        default: false,
        allowNull: false,
      },
    },
    { timestamps: false }
  );
  const Task = mongoose.model("tasks", schema);
  return Task;
};
