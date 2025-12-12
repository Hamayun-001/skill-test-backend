import jwt from "jsonwebtoken";

const SECRET = "MY_SUPER_SECRET";

export const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "2h" });

export const decodeToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};
