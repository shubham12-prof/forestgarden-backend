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

router.post("/add-user", authMiddleware, addUser);
router.get("/my-children", authMiddleware, getMyChildren);
router.get("/tree", authMiddleware, getUserTree);
router.get("/:id", authMiddleware, getUserById);
router.delete("/delete/:userId", authMiddleware, deleteUser);
router.put("/:userId", authMiddleware, updateUser);
module.exports = router;
