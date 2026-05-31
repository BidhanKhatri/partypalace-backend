import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bookingId: String,
  pidx: { type: String, unique: true, sparse: true },
  amount: Number,
  status: String,
  payload: Object,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Payment", paymentSchema);
