require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const meRoute = require("./routes/me");

const app = express();
const port = process.env.PORT;

// Usa o cookieParser antes das rotas
app.use(cookieParser());

// ...restante configuração...

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.VERCEL_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS origin check:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Rotas
app.use(meRoute);

app.get("/", function (req, res) {
  res.status(200).json({ message: "home" });
});

app.use("/tasks", require("./routes/tasks.routes.js"));
app.use("/users", require("./routes/users.routes.js"));
app.use("/messages", require("./routes/messages.routes.js"));
app.use("/accessories", require("./routes/accessories.routes.js"));
app.use("/preset-messages", require("./routes/presetMessages.routes.js"));
app.use("/forms", require("./routes/form.routes.js"));
app.use("/form-answers", require("./routes/formAnswers.routes.js"));

app.all("*", function (req, res) {
  res.status(404).json({ message: "Endpoint not found" });
});

const server = app.listen(port || 3000, () =>
  console.log(`App listening on port ${port || 3000}`)
);

module.exports = { app, server };
