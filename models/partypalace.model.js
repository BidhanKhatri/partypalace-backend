import mongoose from "mongoose";

const partyPalaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    pricePerHour: { type: Number, required: true },
    category: { type: [String], required: true },
    unavailableDates: [{ type: Date }],
    images: [{ type: String }],
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

partyPalaceSchema.index(
  {
    name: "text",
    description: "text",
  },
  {
    weights: { name: 10, descriptio: 5 },
  }
);

const PartyPalace = mongoose.model("PartyPalace", partyPalaceSchema);
export default PartyPalace;
