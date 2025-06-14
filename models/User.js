const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    fatherName: String,
    isAdmin: { type: Boolean, default: false },
    dob: String,
    leftChild: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rightChild: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    gender: String,
    maritalStatus: String,
    phone: String,
    email: { type: String, unique: true },
    nomineeName: String,
    nomineeRelation: String,
    nomineePhone: String,
    address: String,
    pinCode: String,
    bankName: String,
    branchAddress: String,
    accountNo: String,
    accountType: String,
    ifscCode: String,
    micrNo: String,
    panNo: String,
    aadhaarNo: String,
    sponsorName: String,
    sponsorId: String,
    password: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
