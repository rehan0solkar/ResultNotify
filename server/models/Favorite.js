const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  title: String,
  pdfUrl: String,
  date: String,
  userEmail: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);