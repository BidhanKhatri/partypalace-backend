import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
     password: {
    type: String,
    required: function () {
      return !this.googleId; // require only for non-Google accounts
    },
  },
   googleId: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    //updated fileds
    cameraMans: [{ type: mongoose.Schema.Types.ObjectId, ref: "CameraMan" }],
    otp: { type: Number },
    profileImage: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
