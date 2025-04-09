module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      question: {
        type: String,
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
  const Form = mongoose.model("form", schema);
  return Form;
};
