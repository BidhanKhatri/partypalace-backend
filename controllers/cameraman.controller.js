import bcrypt from "bcryptjs";
import CameraMan from "../models/cameraman.model.js";
import uploadImageCloudinary from "../utils/uploadImageCloud.js";
import mongoose from "mongoose";

//create cameraman
export const createCameraManController = async (req, res) => {
  try {
    const { name, email, mobile, password, experienceYears, coordinates } =
      req.body;

    const profileImage = req.file;
    // console.log("profile image", profileImage);

    if (!name || !email || !mobile || !password || !experienceYears) {
      return res.status(400).json({
        success: false,
        error: true,
        msg: "All fields are required",
      });
    }

    //parsing coordinates
    const parsedCoordinates = JSON.parse(coordinates); // form data string ma huncha so parse garna parcha array ma change garna lie

    if (parsedCoordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        error: true,
        msg: "Coordinates should be of length 2, longitude and latitude",
      });
    }

    if (!profileImage) {
      return res.status(400).json({
        success: false,
        error: true,
        msg: "Profile image is required",
      });
    }

    await CameraMan.syncIndexes().then(() => {
      console.log("Indexes synced");
    });

    //checking existing cameraman

    const existingCameraMan = await CameraMan.findOne({ email });

    if (existingCameraMan)
      return res.status(400).json({ msg: "cameraman already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //upload image to cloudinary
    const uploadedImage = await uploadImageCloudinary(profileImage);

    const createCameraMan = await CameraMan.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      profileImage: uploadedImage.secure_url,
      experienceYears,
      baseLocation: {
        type: "Point",
        coordinates: parsedCoordinates,
      },
    });

    return res.status(200).json({
      success: true,
      error: false,
      msg: "CameraMan created successfully",
      data: createCameraMan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      msg: error.message || error || "Internal server errror",
    });
  }
};

//find the nearest cameraman
export const findNearestCameraMan = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    // console.log(lat, lng);

    // const parsedCoordinates = JSON.parse(coordinates);
    const coordinates = [lat, lng];

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        error: true,
        msg: "longitude and latitude is required",
      });
    }
    const query = {
      baseLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates,
          },
          $maxDistance: 5000, //5 km
        },
      },
    };

    const nearestCameraMan = await CameraMan.find(query).select("-password");

    if (nearestCameraMan.length === 0) {
      return res.status(400).json({
        success: false,
        error: true,
        msg: "No cameraman found near you, try in another location",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      msg: "Nearest CameraMan found successfully",
      data: nearestCameraMan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      msg: error.message || error || "Internal server errror",
    });
  }
};

//get all cameraman
export const getAllCameraMan = async (req, res) => {
  try {
    const cameraMans = await CameraMan.find({}).select("-password").lean();

    if (cameraMans.length === 0) {
      return res.status(400).json({
        msg: "No cameraman found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      msg: "CameraMan found successfully",
      error: false,
      success: true,
      data: cameraMans,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      error: true,
      success: false,
    });
  }
};

//book cameraman

export const bookCameraMan = async (req, res) => {
  try {
    const userId = req?.userId; // set by auth middleware
    const userRole = req?.userRole; // set by auth middleware

    let { cameramanId, bookingDate } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Valid userId is required",
        success: false,
        error: true,
      });
    }

    if (!cameramanId || !mongoose.Types.ObjectId.isValid(cameramanId)) {
      return res.status(400).json({
        message: "Valid cameramanId is required",
        success: false,
        error: true,
      });
    }

    // normalise the date to midnight so "2025‑07‑13 09:00" === "2025‑07‑13 18:00"
    const dateOnly = new Date(bookingDate);
    dateOnly.setHours(0, 0, 0, 0);

    /* -------------------------- availability check ----------------------- */

    const cameraMan = await CameraMan.findById(cameramanId).lean();

    if (!cameraMan) {
      return res.status(404).json({
        message: "CameraMan not found",
        success: false,
        error: true,
      });
    }

    const alreadyBooked = cameraMan.unavailableDates.some((d) => {
      const tmp = new Date(d);
      tmp.setHours(0, 0, 0, 0);
      return tmp.getTime() === dateOnly.getTime();
    });

    if (alreadyBooked) {
      return res.status(400).json({
        message: "CameraMan is unavailable on this date",
        success: false,
        error: true,
      });
    }

    /* ---------------------- update & return fresh data ------------------- */

    const bookedCameraMan = await CameraMan.findByIdAndUpdate(
      cameramanId,
      {
        bookedBy: userId,
        $addToSet: { unavailableDates: dateOnly }, // prevents duplicates
      },
      { new: true }
    ).select("-password"); // never return hashes

    return res.status(200).json({
      message: "CameraMan booked successfully",
      success: true,
      error: false,
      data: bookedCameraMan,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//get unavailable dates of cameraMan
export const getUnavailableDates = async (req, res) => {
  try {
    const { cameraManId } = req.params;

    if (!cameraManId || !mongoose.Types.ObjectId.isValid(cameraManId)) {
      return res.status(400).json({
        message: "Valid cameraManId is required",
        success: false,
        error: true,
      });
    }

    const cameraMan = await CameraMan.findById(cameraManId).lean();

    if (!cameraMan) {
      return res.status(404).json({
        message: "CameraMan not found",
        success: false,
        error: true,
      });
    }

    // ensure we always return an array (might be empty)
    const unavailableDates = cameraMan.unavailableDates ?? [];

    return res.status(200).json({
      message: "Unavailable dates fetched successfully",
      success: true,
      error: false,
      data: unavailableDates,
    });
  } catch (error) {
    console.error("getUnavailableDates error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
      error: true,
    });
  }
};
