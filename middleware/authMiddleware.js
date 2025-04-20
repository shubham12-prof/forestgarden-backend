const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    if (!req.user.isAdmin) {
      return res.status(403).json({
        message: "Access denied, only admins can perform this action",
      });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token failed" });
  }
};

module.exports = authMiddleware;
