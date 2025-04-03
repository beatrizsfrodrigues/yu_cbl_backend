module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      code: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      username: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      email: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      password: {
        type: String,
        trim: true,
        allowNull: false,
        required: true,
      },
      points: {
        type: Number,
        default: 0,
      },
      role: { 
        type: String, 
        default: 'user'
       } ,
      partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      accessoriesOwned: {
        type: Array,
        default: [40],
      },
      accessoriesEquipped: {
        type: Object,
        default: {
          hat: null,
          shirt: null,
          color: 40,
          background: null,
        },
      },
      mascot: {
        type: String,
        default:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      },
      completedTasks: {
        type: Array,
        default: [],
      },
    },
    { timestamps: false }
  );
  const User = mongoose.model("User", schema);
  return User;
};
