const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getUserTree = async (req, res) => {
  try {
    const buildTree = async (userId) => {
      const user = await User.findById(userId).populate("children");
      if (!user) return null;

      const children = await Promise.all(
        user.children.map((child) => buildTree(child._id))
      );

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        children: children.filter(Boolean),
      };
    };

    const tree = await buildTree(req.user.id);
    if (!tree) return res.status(404).json({ message: "User not found" });
    res.json(tree);
  } catch (err) {
    console.error("Tree error:", err);
    res
      .status(500)
      .json({ message: "Error building user tree", error: err.message });
  }
};

const addUser = async (req, res) => {
  try {
    const parent = req.user;
    const parentId = parent._id;

    const {
      name,
      fatherName,
      dob,
      gender,
      maritalStatus,
      phone,
      email,
      nomineeName,
      nomineeRelation,
      nomineePhone,
      address,
      pinCode,
      bankName,
      branchAddress,
      accountNo,
      accountType,
      ifscCode,
      micrNo,
      panNo,
      aadhaarNo,
      sponsorId,
      sponsorName,
      password,
    } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const childCount = await User.countDocuments({ parent: parentId });
    if (childCount >= 2) {
      return res.status(400).json({ message: "You can only add 2 users." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      fatherName,
      dob,
      gender,
      maritalStatus,
      phone,
      email,
      nomineeName,
      nomineeRelation,
      nomineePhone,
      address,
      pinCode,
      bankName,
      branchAddress,
      accountNo,
      accountType,
      ifscCode,
      micrNo,
      panNo,
      aadhaarNo,
      sponsorName,
      sponsorId,
      parent: parentId,
      addedBy: parentId,
      password: hashedPassword,
    });

    const parentUser = await User.findById(parentId);
    if (!parentUser.children) {
      parentUser.children = [];
    }
    parentUser.children.push(newUser._id);
    await parentUser.save();

    res.status(201).json({ message: "User added successfully", newUser });
  } catch (err) {
    console.error("Error adding user:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyChildren = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("children");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ children: user.children });
    console.log("Fetched user's children:", user.children);
  } catch (err) {
    console.error("Error fetching children:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const parent = req.user;

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    const parentUser = await User.findById(userToDelete.parent);
    if (parentUser) {
      parentUser.children = parentUser.children.filter(
        (childId) => childId.toString() !== userId
      );
      await parentUser.save();
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const admin = req.user;
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit users." });
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedData = {
      name: req.body.name || userToUpdate.name,
      fatherName: req.body.fatherName || userToUpdate.fatherName,
      dob: req.body.dob || userToUpdate.dob,
      gender: req.body.gender || userToUpdate.gender,
      maritalStatus: req.body.maritalStatus || userToUpdate.maritalStatus,
      phone: req.body.phone || userToUpdate.phone,
      email: req.body.email || userToUpdate.email,
      nomineeName: req.body.nomineeName || userToUpdate.nomineeName,
      nomineeRelation: req.body.nomineeRelation || userToUpdate.nomineeRelation,
      nomineePhone: req.body.nomineePhone || userToUpdate.nomineePhone,
      address: req.body.address || userToUpdate.address,
      pinCode: req.body.pinCode || userToUpdate.pinCode,
      bankName: req.body.bankName || userToUpdate.bankName,
      branchAddress: req.body.branchAddress || userToUpdate.branchAddress,
      accountNo: req.body.accountNo || userToUpdate.accountNo,
      accountType: req.body.accountType || userToUpdate.accountType,
      ifscCode: req.body.ifscCode || userToUpdate.ifscCode,
      micrNo: req.body.micrNo || userToUpdate.micrNo,
      panNo: req.body.panNo || userToUpdate.panNo,
      aadhaarNo: req.body.aadhaarNo || userToUpdate.aadhaarNo,
      sponsorName: req.body.sponsorName || userToUpdate.sponsorName,
      sponsorId: req.body.sponsorId || userToUpdate.sponsorId,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res.json({ message: "User updated successfully", updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  addUser,
  getMyChildren,
  getUserById,
  getUserTree,
  deleteUser,
  updateUser,
};
