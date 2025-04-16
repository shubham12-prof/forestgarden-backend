const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    fatherName: String,
    dob: String,
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
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
