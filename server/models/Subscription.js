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

module.exports = mongoose.model(
  "Subscription",
  subscriptionSchema
);