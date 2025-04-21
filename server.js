const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");

dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://forestgarden-frontend.vercel.app",
  "https://www.forest-garden.in",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("ForestGarden Backend Running");
});

app.get("/api/users/test", (req, res) => {
  res.json({ message: "Test route working!" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));
