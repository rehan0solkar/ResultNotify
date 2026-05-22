import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userEmail: String,
    title: String,
    pdfUrl: String,
    resultDate: String,
  },
  { timestamps: true }
);

const Favorite =
  mongoose.models.Favorite ||
  mongoose.model("Favorite", favoriteSchema);

export default Favorite;