import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import PartyPalace from "../models/partypalace.model.js";

//create booking
// export const createBookingController = async (req, res) => {
//   try {
//     const userRole = req.userRole;
//     const userId = req.userId;

//     const { partyPalaceId, bookingDate, hoursBooked, totalPrice } = req.body;

//     console.log(partyPalaceId, bookingDate, hoursBooked, totalPrice);

//     if (userRole !== "user") {
//       return res.status(401).json({
//         msg: "only user can create booking",
//         success: false,
//         error: true,
//       });
//     }

//     // ✅ Format date (keep only YYYY-MM-DD)
//     const formattedDate = new Date(bookingDate).toISOString().split("T")[0];

//     // ✅ Check if date already unavailable
//     const findPartyPalace = await PartyPalace.findById(partyPalaceId);

//     const existingDates = findPartyPalace.unavailableDates.map(
//       (d) => new Date(d).toISOString().split("T")[0]
//     );

//     if (existingDates.includes(formattedDate)) {
//       return res.status(400).json({
//         msg: "Selected date is already unavailable",
//         success: false,
//         error: true,
//       });
//     }

//     // ✅ Create booking
//     const bookPalace = new Booking({
//       user: userId,
//       partyPalace: partyPalaceId,
//       bookingDate: formattedDate,
//       hoursBooked,
//       totalPrice,
//     });

//     await bookPalace.save();

//     // ✅ Add unavailable date to PartyPalace
//     await PartyPalace.findByIdAndUpdate(
//       partyPalaceId,
//       { $push: { unavailableDates: formattedDate } },
//       { new: true }
//     );

//     return res.status(200).json({
//       msg: "Party palace booked successfully",
//       success: true,
//       error: false,
//       data: bookPalace,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       msg: error.message || "Internal server error",
//       success: false,
//       error: true,
//     });
//   }
// };

export const createBookingController = async (req, res) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;

    if (userRole !== "user") {
      return res.status(401).json({
        msg: "Only users can create a booking",
        success: false,
        error: true,
      });
    }

    const {
      partyPalaceId,
      bookingDate,
      eventType,
      guestCount,
      packageType,
      specialRequirements,
      totalPrice,
      advancePaid,
    } = req.body;

    if (
      !partyPalaceId ||
      !bookingDate ||
      !eventType ||
      !guestCount ||
      !totalPrice
    ) {
      return res.status(400).json({
        msg: "Required fields are missing",
        success: false,
        error: true,
      });
    }

    // Format date — keep only YYYY-MM-DD
    const formattedDate = new Date(bookingDate).toISOString().split("T")[0];

    // Check if palace exists
    const palace = await PartyPalace.findById(partyPalaceId);
    if (!palace) {
      return res.status(404).json({
        msg: "Party palace not found",
        success: false,
        error: true,
      });
    }

    // Check if date already booked
    const existingDates = palace.unavailableDates.map(
      (d) => new Date(d).toISOString().split("T")[0]
    );

    if (existingDates.includes(formattedDate)) {
      return res.status(400).json({
        msg: "Selected date is already booked",
        success: false,
        error: true,
      });
    }

    // Create booking
    const newBooking = new Booking({
      user: userId,
      partyPalace: partyPalaceId,
      bookingDate: formattedDate,

      eventType,
      guestCount,
      package: packageType,
      specialRequirements,

      totalPrice,
      advancePaid,
      paymentStatus: advancePaid >= totalPrice ? "paid" : "partial",
    });

    await newBooking.save();

    // Add unavailable date to party palace
    await PartyPalace.findByIdAndUpdate(
      partyPalaceId,
      { $push: { unavailableDates: formattedDate } },
      { new: true }
    );

    return res.status(200).json({
      msg: "Party palace booked successfully",
      success: true,
      error: false,
      data: newBooking,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message || "Internal server error",
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
