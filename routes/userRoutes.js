const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { getUserTree } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add-user", authMiddleware, async (req, res) => {
  const { name, email, password } = req.body;
  const parent = req.user.id;

  const parentUser = await User.findById(parent).populate("children");
  if (parentUser.children.length >= 2) {
    return res.status(400).json({ message: "You can only add 2 users." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    parent,
  });

  parentUser.children.push(newUser._id);
  await parentUser.save();

  res.status(201).json({ message: "User added successfully", newUser });
});
router.get("/tree", authMiddleware, getUserTree);
module.exports = router;
