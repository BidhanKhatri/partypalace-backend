import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import PartyPalace from "../models/partypalace.model.js";

//get party palace booking details (admin)
export const getBookingDetailsControllerAdmin = async (req, res) => {
  try {
    const userRole = req?.userRole;
    const { partyPalaceId } = req.query;
    // console.log(partyPalaceId);
    const formattedPartyPalaceId = new mongoose.Types.ObjectId(partyPalaceId);

    if (userRole !== "admin") {
      return res.status(401).json({
        msg: "only admin can get booking details",
        success: false,
        error: true,
      });
    }

    if (!partyPalaceId) {
      return res.status(400).json({
        msg: "partyPalaceId is required",
        success: false,
        error: true,
      });
    }

    const getBooking = await Booking.find({
      partyPalace: formattedPartyPalaceId,
    })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("partyPalace");

    // console.log("Booking Query Result:", getBooking);

    if (getBooking.length === 0) {
      return res.status(404).json({
        msg: "Booking details not found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      msg: "Booking details found",
      success: true,
      error: false,
      data: getBooking,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};

//change booking status (admin)
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const userRole = req?.userRole;

    // allowed status values
    const validStatuses = ["pending", "confirmed", "cancelled"];

    if (userRole !== "admin") {
      return res.status(401).json({
        msg: "only admin can update status",
        error: true,
        success: false,
      });
    }

    if (!bookingId || !status) {
      return res.status(400).json({
        msg: "bookingId and status is required",
        error: true,
        success: false,
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        msg: `Invalid status type, the valide staus are ${validStatuses.join(
          ", "
        )}`,
        success: false,
        error: true,
      });
    }

    const updateStatus = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: { status: status },
      },
      { new: true }
    );

    if (updateStatus && status === "confirmed") {
      const partyPalaceId = updateStatus?.partyPalace.toString();
      const partyPalaceUnavailableDate = await PartyPalace.findByIdAndUpdate(
        partyPalaceId,
        {
          $push: { unavailableDates: updateStatus?.bookingDate },
        }
      );

      return res.status(200).json({
        msg: "status updated successfully",
        success: true,
        error: false,
        data: updateStatus,
      });
    }

    return res.status(200).json({
      msg: "status updated successfully",
      success: true,
      error: false,
      data: updateStatus,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || error || "Internal server error",
      success: false,
      error: true,
    });
  }
};
