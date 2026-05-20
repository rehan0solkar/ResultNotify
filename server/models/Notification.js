const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    date: String,
    pdfUrl: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);