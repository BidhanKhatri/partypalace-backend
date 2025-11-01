import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  partyPalaceId: { type: mongoose.Schema.Types.ObjectId, ref: "PartyPalace" },
  reviews: {
    comment: { type: String, default: "" },
    ratings: { type: Number, default: 0, max: 5 },
  },
  reviewBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
