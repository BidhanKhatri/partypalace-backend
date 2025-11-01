import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req?.cookies?.token || req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        msg: "token is required",
        success: false,
        error: true,
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decode);

    if (!decode) {
      return res.status(401).json({
        msg: "unauthorized access",
        error: true,
        success: false,
      });
    }

    req.userId = decode?.id;
    req.userRole = decode?.role;

    next();
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error.msg || "Internal server error",
      success: false,
      error: true,
    });
  }
};
