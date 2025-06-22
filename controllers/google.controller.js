// controllers/google.controller.js
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken"); // <--- ADD THIS LINE
const db = require("../models");
const User = db.users;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

exports.login = async (req, res, next) => {
  const { credential } = req.body;

  if (!credential) {
    return res
      .status(400)
      .json({ message: "No Google credential (ID token) provided." });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const usernameFromEmail = email.split("@")[0].replace(/\s/g, "");

    let user = null;

    user = await User.findOne({ googleId: googleId });

    if (user) {
      if (user.email !== email || user.username !== usernameFromEmail) {
        user.email = email;
        user.username = usernameFromEmail;
        await user.save();
      }
    } else {
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

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET,
      { expiresIn: "24h" }
    );

    const { password, ...userWithoutPassword } = user.toObject();
    return res.status(200).json({
      success: true,
      message: "Google login successful!",
      token: token, // <--- SEND THE TOKEN BACK
      user: userWithoutPassword,
    });
    // --- END REPLACEMENT ---
  } catch (error) {
    console.error(
      "Error verifying Google ID token or processing login:",
      error
    );
    if (
      error.code === "ERR_INVALID_ARG_VALUE" &&
      error.message.includes("Invalid audience")
    ) {
      return res.status(401).json({
        message:
          "Google authentication failed: Invalid Client ID or audience mismatch. Check your GOOGLE_CLIENT_ID.",
      });
    }
    if (error.code === 11000 && error.message.includes("username_1")) {
      return res.status(409).json({
        message: "A user with this derived username already exists.",
        error: error.message,
      });
    }
    return res
      .status(401)
      .json({ message: "Google authentication failed.", error: error.message });
  }
};
