module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        allowNull: false,
        required: true,
      },
      date: {
        type: Number,
        allowNull: false,
        required: true,
      },
      answers: {
        type: Array,
        allowNull: false,
        required: true,
      },
    },
    { timestamps: false }
  );
  const FormAnswer = mongoose.model("formAnswers", schema);
  return FormAnswer;
};
