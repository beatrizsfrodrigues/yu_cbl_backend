const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");
const db = {};
db.mongoose = mongoose;

(async () => {
  try {
    console.log("Connecting to database:", dbConfig.URL);
    await db.mongoose.connect(dbConfig.URL, {
      dbName: dbConfig.DB,
    });
    console.log("Connected to the database");
  } catch (error) {
    console.log("Cannot connect to the database", error);
    process.exit(1); // Exit the application with an error code
  }
})();

db.users = require("./users.model.js")(mongoose);
db.tasks = require("./tasks.model.js")(mongoose);
db.messages = require("./messages.model.js")(mongoose);
db.accessories = require("./accessories.model.js")(mongoose);
module.exports = db;
