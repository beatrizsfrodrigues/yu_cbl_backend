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
        required: true,
        default: 0,
      },
      answers: [
        {
          question: {
            type: String,
            required: true,
          },
          answer: {
            type: String,
            required: true,
          },
        },
      ],
    },
    { timestamps: false }
  );
  const FormAnswer = mongoose.model("form-answers", schema);
  return FormAnswer;
};
