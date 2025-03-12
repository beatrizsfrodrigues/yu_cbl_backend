module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        allowNull: false,
        required: true,
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
      completedDate: Number,
      picture: String,
      verified: {
        type: Boolean,
        default: false,
        allowNull: false,
      },
      rejectMessage: String,
    },
    { timestamps: false }
  );
  const Task = mongoose.model("tasks", schema);
  return Task;
};
