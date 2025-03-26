const config = {
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  HOST: process.env.DB_HOST,
  SECRET: process.env.SECRET,
};

// You can switch between the local connection and MongoDB Atlas depending on your environment
if (process.env.NODE_ENV === "production") {
  // MongoDB Atlas connection string
  config.URL = `mongodb+srv://${config.USER}:${config.PASSWORD}@${config.HOST}/${config.DB}?retryWrites=true&w=majority`;
} else {
  // Local MongoDB connection string
  config.URL = "mongodb://localhost:27017/YU";
}

module.exports = config;

/*
//ligacao para a local 
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { //configurar a ligação à bd
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;*/
