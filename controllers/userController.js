const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { decryptData } = require("../utils/cryptohelper");
const { encryptData } = require("../utils/cryptohelper");
const User = require("../models/User");

const getUserTree = async (req, res) => {
  try {
    const buildTree = async (userId) => {
      const user = await User.findById(userId)
        .populate("leftChild")
        .populate("rightChild");

      if (!user) return null;

      const children = [];

      if (user.leftChild) {
        const leftChild = await buildTree(user.leftChild._id);
        if (leftChild)
          children.push({ ...leftChild, side: "left" });
      }

      if (user.rightChild) {
        const rightChild = await buildTree(user.rightChild._id);
        if (rightChild)
          children.push({ ...rightChild, side: "right" });
      }

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        children: children,
      };
    };

    const tree = await buildTree(req.user.id);
    if (!tree) return res.status(404).json({ message: "User not found" });

    res.json(tree);
  } catch (err) {
    console.error("Tree error:", err);
    res.status(500).json({ message: "Error building user tree", error: err.message });
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
      isAdmin,
      side, // mandatory now
    } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!side) {
      return res.status(400).json({ message: "Side (left or right) must be selected" });
    }

    if (!["left", "right"].includes(side)) {
      return res.status(400).json({ message: "Invalid side selected" });
    }

    const parentUser = await User.findById(parentId);
    if (!parentUser) {
      return res.status(404).json({ message: "Parent not found" });
    }

    if (side === "left" && parentUser.leftChild) {
      return res.status(400).json({ message: "Left side already assigned" });
    }

    if (side === "right" && parentUser.rightChild) {
      return res.status(400).json({ message: "Right side already assigned" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdminBoolean = isAdmin === "on" || isAdmin === true;

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
      accountNo: encryptData(accountNo),
      accountType,
      ifscCode: encryptData(ifscCode),
      micrNo: encryptData(micrNo),
      panNo: encryptData(panNo),
      aadhaarNo: encryptData(aadhaarNo),
      sponsorName,
      sponsorId,
      parent: parentId,
      password: hashedPassword,
      isAdmin: isAdminBoolean,
      side,
    });

    if (!parentUser.children) parentUser.children = [];

    if (side === "left") {
      parentUser.leftChild = newUser._id;
      parentUser.children[0] = newUser._id;
    } else {
      parentUser.rightChild = newUser._id;
      parentUser.children[1] = newUser._id;
    }

    await parentUser.save();

    res.status(201).json({ message: `User added successfully to ${side} side`, newUser });
  } catch (err) {
    console.error("Error adding user:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



const getMyChildren = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("leftChild")
      .populate("rightChild");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const children = [user.leftChild, user.rightChild].filter(Boolean).map((child) => ({
      ...child._doc,
      aadhaarNo: decryptData(child.aadhaarNo),
      panNo: decryptData(child.panNo),
      accountNo: decryptData(child.accountNo),
      ifscCode: decryptData(child.ifscCode),
      micrNo: decryptData(child.micrNo),
    }));

    res.json({ children });
    console.log("Fetched and decrypted user's children:", children);
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

    user.aadhaarNo = decryptData(user.aadhaarNo);
    user.panNo = decryptData(user.panNo);
    user.accountNo = decryptData(user.accountNo);
    user.ifscCode = decryptData(user.ifscCode);
    user.micrNo = decryptData(user.micrNo);

    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;


    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }


    const parentUser = await User.findById(userToDelete.parent);
    if (parentUser) {

      if (parentUser.leftChild && parentUser.leftChild.toString() === userId) {
        parentUser.leftChild = null;
      }

      else if (parentUser.rightChild && parentUser.rightChild.toString() === userId) {
        parentUser.rightChild = null;
      }
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
    const userId = req.params.userid;
    const loggedInUser = req.user;

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAuthorized =
      loggedInUser.isAdmin ||
      (userToUpdate.parent &&
        userToUpdate.parent.toString() === loggedInUser._id.toString()) ||
      userToUpdate._id.toString() === loggedInUser._id.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this user." });
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

      isAdmin:
        req.body.isAdmin !== undefined
          ? req.body.isAdmin
          : userToUpdate.isAdmin,
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
