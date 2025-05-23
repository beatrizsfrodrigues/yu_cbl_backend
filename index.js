require("dotenv").config(); // read environment variables from .env file
const express = require("express");
const cors = require("cors"); // middleware to enable CORS (Cross-Origin Resource Sharing)
const app = express();
const port = process.env.PORT; // use environment variables
const host = process.env.HOST;

const allowedOrigin = process.env.CLIENT_URL;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); //enable parsing JSON body data

app.get("/", function (req, res) {
  res.status(200).json({ message: "home" });
});

app.use("/tasks", require("./routes/tasks.routes.js"));
app.use("/users", require("./routes/users.routes.js"));
app.use("/messages", require("./routes/messages.routes.js"));
app.use("/accessories", require("./routes/accessories.routes.js"));
app.use("/preset-messages", require("./routes/presetMessages.routes.js"));
app.use("/accessories", require("./routes/accessories.routes.js"));
app.use("/forms", require("./routes/form.routes.js"));
app.use("/form-answers", require("./routes/formAnswers.routes.js"));

app.all("*", function (req, res) {
  res.status(404).json({ message: "Endepoint not found" });
});
const server = app.listen(port, host, () =>
  console.log(`App listening at http://${host}:${port}/`)
);

module.exports = { app, server };
