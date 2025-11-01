import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { oauth2Client } from "../utils/googleConfig.js";
import axios from "axios";

//signup controller
export const signupController = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "All fields are required",
        success: false,
        error: true,
      });
    }
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(400).json({
        msg: "User already exists",
        success: false,
        error: true,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await createUser.save();

    return res.status(200).json({
      msg: "user created successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      msg: error.message || "Internal server error",
    });
  }
};

// login
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "email and password are required",
        error: true,
        success: false,
      });
    }

    const findUser = await User.findOne({ email });

    if (!findUser) {
      return res.status(401).json({
        msg: "Invalid credentials",
        success: false,
        error: true,
      });
    }

    if (findUser.googleId) {
      return res.status(401).json({
        msg: "Invalid credentials",
        success: false,
        error: true,
      });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      return res.status(401).json({
        msg: "Invalid credentials",
        success: false,
        error: true,
      });
    }

    const token = generateToken(findUser._id, findUser.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      msg: "Login successful",
      token: token,
      user: findUser.username,
      role: findUser.role,
      userId: findUser._id,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

//google login

export const loginGoogleController = async (req, res) => {
  try {
    const { code } = req.query;
    console.log("🔹 Google auth code:", code);

    // Choose redirect URI based on environment
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? process.env.GOOGLE_REDIRECT_URI_PROD
        : process.env.GOOGLE_REDIRECT_URI_DEV;

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: redirectUri,
    });

    console.log("🔹 Google tokens received:", tokens);

    oauth2Client.setCredentials(tokens);

    // Fetch user info
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
    );

    console.log("🔹 Google user data:", userRes.data);

    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: name,
        email,
        image: picture,
        role: "user",
        googleId: userRes.data.id,
      });
    }

    const token = generateToken(user._id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      msg: "Login successful",
      token,
      user: user.username,
      role: user.role,
      userId: user._id,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error(
      "❌ Google login error:",
      error.response?.data || error.message || error
    );
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Google login failed",
    });
  }
};

//logout
export const logoutController = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 0,
    });

    return res.status(200).json({
      msg: "Logout successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};
