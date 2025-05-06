const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  addUser,
  getMyChildren,
  getUserById,
  getUserTree,
  deleteUser,
  updateUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/add-user", authMiddleware(), addUser);
router.get("/my-children", authMiddleware(), getMyChildren);
router.get("/tree", authMiddleware(), getUserTree);
router.get("/:id", authMiddleware(), getUserById);
router.delete("/delete/:userId", authMiddleware(), deleteUser);
router.put("/:userid", authMiddleware("admin"), updateUser);
router.get("/profile", authMiddleware(), async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
