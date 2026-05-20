const mongoose = require("mongoose");


const subscriptionSchema =
  new mongoose.Schema(
    {
      userEmail: String,
      course: String,
      semester: String,
    },
    {
      timestamps: true,
    }
  );
export default mongoose.models.Subscription || mongoose.model("Subscription",subscriptionSchema);