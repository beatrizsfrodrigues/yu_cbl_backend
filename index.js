require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const meRoute = require("./routes/me");

const app = express();
const port = process.env.PORT || 3000;

// ✅ Trust proxy is REQUIRED for secure cookies over HTTPS on platforms like Render
app.set("trust proxy", 1);

// ✅ Parse cookies early
app.use(cookieParser());

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Define all allowed origins (don't forget to add your real Vercel frontend domain too)
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.VERCEL_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean); // removes undefined/null

// ✅ Proper CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS origin check:", origin);

      // Some requests (like Postman or server-to-server) may have no origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // 🔥 Required to receive/send cookies cross-origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ ROUTES
app.use(meRoute);

app.get("/", (req, res) => {
  res.status(200).json({ message: "home" });
});

app.use("/tasks", require("./routes/tasks.routes.js"));
app.use("/users", require("./routes/users.routes.js"));
app.use("/messages", require("./routes/messages.routes.js"));
app.use("/accessories", require("./routes/accessories.routes.js"));
app.use("/preset-messages", require("./routes/presetMessages.routes.js"));
app.use("/forms", require("./routes/form.routes.js"));
app.use("/form-answers", require("./routes/formAnswers.routes.js"));

// ✅ 404 fallback
app.all("*", (req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// ✅ Start server
const server = app.listen(port, () =>
  console.log(`✅ Server running on port ${port}`)
);

module.exports = { app, server };
