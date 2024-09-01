const express = require("express");
const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path"); 


const { sendMail } = require('./mailer');








// Configuration de multer pour le téléchargement de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});





const upload = multer({ storage: storage });
authRouter.post("/api/signup",upload.single('user_img'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user_img = req.file.filename;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with same email already exists!" });
    }

    const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomCode = "";
    for (let i = 0; i < 6; i++) {
      randomCode += characters[Math.floor(Math.random() * characters.length)];
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    let user = new User({
      email,
      password: hashedPassword,
      name,
      activationCode: randomCode,
      user_img 
    });

    user = await user.save();

    // Envoyer l'e-mail de confirmation
    const result = await sendMail(name, email, user.activationCode, password);
    console.log('Email sent:', result);

    res.json(user);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});










// Sign In

authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(403).json({ msg: "User with this email does not exist!" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(402).json({ msg: "Incorrect password." });
    }

        // Vérifier si le compte est activé
        if (!user.accountStatus) {
          return res.status(401).json({ msg: "Account not activated. Please activate your account." });
        }



    const token = jwt.sign({ id: user._id }, "passwordKey");
    res.json({ token, ...user._doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }


});






authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, "passwordKey");
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});







// Vérification du code d'activation
authRouter.post("/api/activate", async (req, res) => {
  try {
    const { email, activationCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Vérifier si le code d'activation correspond
    if (user.activationCode !== activationCode) {
      return res.status(400).json({ msg: "Incorrect activation code." });
    }

    // Mettre à jour l'attribut accountStatus à true car le code d'activation est correct
    user.accountStatus = true;
    await user.save();

    res.json({ msg: "Account activated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});










// Update User Data
authRouter.put("/api/user/update", auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user; // Récupérer l'ID de l'utilisateur à partir du jeton JWT

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Mettre à jour les données de l'utilisateur
    if (name) {
      user.name = name;
    }
    if (email) {
      // Vérifier si un autre utilisateur a déjà cet email
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ msg: "Email already in use" });
      }
      user.email = email;
    }

    // Sauvegarder les modifications dans la base de données
    await user.save();

    res.json({ msg: "User data updated successfully", user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});









// get user data
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

module.exports = authRouter;
