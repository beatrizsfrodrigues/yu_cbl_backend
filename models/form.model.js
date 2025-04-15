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
      active: {
        type: Boolean,
        allowNull: false,
        default: true,
      },
    },
    { timestamps: false }
  );
  const Form = mongoose.model("forms", schema);
  return Form;
};
