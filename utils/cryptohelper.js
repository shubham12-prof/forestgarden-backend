const CryptoJS = require("crypto-js");

const secretKey = process.env.CRYPTO_SECRET_KEY;

const encryptData = (text) => {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
};

const decryptData = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
module.exports = {
  encryptData,
  decryptData,
};
