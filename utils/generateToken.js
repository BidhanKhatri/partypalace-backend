import { signToken } from "./jwt.js";

const generateToken = (id, role) => {
  const token = signToken({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

export default generateToken;
