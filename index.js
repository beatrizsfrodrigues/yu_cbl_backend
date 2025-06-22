require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Keep if you use for other non-session cookies
const meRoute = require("./routes/me");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const session = require("express-session"); // <-- REMOVE THIS LINE

const db = require("./models"); // Adjust this path if your 'models' directory is elsewhere
const User = db.users; // This assumes 'db.users' correctly exposes your Mongoose User model

const app = express();
const port = process.env.PORT || 3000;

app.set("trust proxy", 1);

app.use(passport.initialize());

app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.VERCEL_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const usernameFromEmail = email.split("@")[0].replace(/\s/g, "");

        let user = await User.findOne({ googleId: googleId });

        if (!user) {
          user = await User.findOne({ email: email });

          if (user) {
            user.googleId = googleId;
            await user.save();
          } else {
            user = await User.create({
              username: usernameFromEmail,
              email: email,
              googleId: googleId,
              password: null,
              role: "user",
              code: Math.random().toString(36).substring(2, 7),
            });
          }
        }
        return done(null, user); // User object passed to the route handler
      } catch (err) {
        console.error("Error during Google authentication:", err);
        return done(err, null);
      }
    }
  )
);

// Proper CORS middleware
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

// ROUTES
app.use(meRoute);

app.get("/", (req, res) => {
  res.status(200).json({ message: "home" });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // Successful login - now issue a JWT!
    const jwt = require("jsonwebtoken"); // Import jsonwebtoken here or at the top
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET, // Make sure you define JWT_SECRET in .env
      { expiresIn: "1h" } // Token expiration
    );

    res.redirect(`${process.env.CLIENT_URL}/home?token=${token}`);
  }
);

app.use("/tasks", require("./routes/tasks.routes.js"));
app.use("/users", require("./routes/users.routes.js"));
app.use("/messages", require("./routes/messages.routes.js"));
app.use("/accessories", require("./routes/accessories.routes.js"));
app.use("/preset-messages", require("./routes/presetMessages.routes.js"));
app.use("/forms", require("./routes/form.routes.js"));
app.use("/form-answers", require("./routes/formAnswers.routes.js"));

// 404 fallback
app.all("*", (req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Start server
const server = app.listen(port, () =>
  console.log(`✅ Server running on port ${port}`)
);

module.exports = { app, server };
