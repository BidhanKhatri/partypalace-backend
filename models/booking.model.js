import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    partyPalace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartyPalace",
      required: true,
    },

    // Store full-day booking as string (YYYY-MM-DD)
    bookingDate: { type: String, required: true },

    // Event information
    eventType: { type: String, required: true }, // wedding, birthday, reception etc.
    guestCount: { type: Number, required: true },
    package: { type: String }, // gold, silver, platinum etc.
    specialRequirements: { type: String },

    // Payment details
    totalPrice: { type: Number, required: true },
    advancePaid: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },

    // Booking Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    // Admin internal notes
    adminNotes: { type: String },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
