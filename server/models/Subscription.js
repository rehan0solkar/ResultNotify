import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userEmail: String,
    course: String,
    semester: String,
  },
  { timestamps: true }
);

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);

export default Subscription;