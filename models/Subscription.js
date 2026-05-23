import mongoose from "mongoose";
const subscriptionSchema = new mongoose.Schema(
  {
    userEmail: String,
    course: String,
    semester: String,
  },
  { timestamps: true }
);
export default mongoose.models.Subscription ||
mongoose.model("Subscription", subscriptionSchema);