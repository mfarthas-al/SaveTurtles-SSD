import jwt from "jsonwebtoken";

// Only allow requests that carry a valid admin JWT
export const requireAdmin = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired token" });
  }

  if (decoded.role !== "admin") {
    return response.status(403).json({ message: "Forbidden" });
  }

  request.admin = decoded;
  next();
};
