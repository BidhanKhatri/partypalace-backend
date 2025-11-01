import mongoose from "mongoose";
import Booking from "../models/booking.model.js";

//create booking
export const createBookingController = async (req, res) => {
  try {
    const userRole = req?.userRole;
    const userId = req?.userId;

    const { partyPalaceId, bookingDate, hoursBooked, totalPrice } = req.body;

    // console.log(partyPalaceId, bookingDate, hoursBooked, totalPrice);

    if (userRole !== "user") {
      return res.status(401).json({
        msg: "only user can create booking",
        success: false,
        error: true,
      });
    }

    const bookPalace = new Booking({
      user: userId,
      partyPalace: partyPalaceId,
      bookingDate,
      hoursBooked,
      totalPrice,
    });

    await bookPalace.save();

    return res.status(200).json({
      msg: "Party palace booked successfully",
      success: true,
      error: false,
      data: bookPalace,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//get booking details (user)
export const getBookingDetailsController = async (req, res) => {
  try {
    const userId = req?.userId;
    const formattedUserId = new mongoose.Types.ObjectId(userId);
    const getBooking = await Booking.find({ user: formattedUserId }).populate(
      "partyPalace"
    );

    if (!getBooking) {
      return res.status(404).json({
        msg: "Booking details not found",
        success: false,
        error: true,
      });
    }

    // console.log(getBooking);

    return res.status(200).json({
      msg: "Booking details found successfully",
      success: true,
      error: false,
      data: getBooking,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      error: true,
      sucess: false,
    });
  }
};

//update booking details
export const updateBookingController = async (req, res) => {
  try {
    const { bookingId, partyPalaceId, bookingDate, hoursBooked, totalPrice } =
      req.body;
    const formattedPartyPalaceId = new mongoose.Types.ObjectId(partyPalaceId);
    const userRole = req?.userRole;

    if (userRole !== "user") {
      return res.status(401).json({
        msg: "only user can update booking",
        success: false,
        error: true,
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        msg: "bookingId is required",
        success: false,
        error: true,
      });
    }

    const updatedPalace = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          partyPalace: formattedPartyPalaceId,
          bookingDate,
          hoursBooked,
          totalPrice,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      msg: "Booking details updated",
      success: true,
      error: false,
      data: updatedPalace,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//cancel booking details
export const cancleBookingController = async (req, res) => {
  try {
    const { bookingId: id } = req.params;

    const userRole = req?.userRole;

    if (userRole !== "user") {
      return res.status(401).json({
        msg: "only user can cancel booking",
        success: false,
        error: true,
      });
    }

    if (!id) {
      return res.status(400).json({
        msg: "booking id is required",
        error: true,
        success: false,
      });
    }

    const canclledBooking = await Booking.findByIdAndDelete(id);

    if (canclledBooking) {
      return res.status(200).json({
        msg: "Booking cancled successfully",
        success: true,
        error: false,
      });
    } else {
      return res.status(404).json({
        msg: "Booking not found",
        success: false,
        error: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      error: true,
      success: false,
    });
  }
};


//