import mongoose from "mongoose";

const cameraManSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin", "cameraman"],
      default: "cameraman",
    },
    experienceYears: { type: Number },
    baseLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unavailableDates: [{ type: Date }],
  },
  {
    timestamps: true,
  }
);

//geospatial index (helps to find nearest camera man using this index)
cameraManSchema.index({ baseLocation: "2dsphere" });

const CameraMan =
  mongoose?.models?.CameraMan || mongoose.model("CameraMan", cameraManSchema);
export default CameraMan;
