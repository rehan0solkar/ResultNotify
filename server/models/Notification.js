import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userEmail: String,
    message: String,
    read: Boolean,
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;