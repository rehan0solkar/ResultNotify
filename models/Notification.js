import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userEmail: String,
    title: String,
    message: String,
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
mongoose.model("Notification", notificationSchema);