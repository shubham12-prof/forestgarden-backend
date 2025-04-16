const bcrypt = require("bcryptjs");

async function generateHashedPassword() {
  const password = "123456";
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password:", hashedPassword);
}

generateHashedPassword();
