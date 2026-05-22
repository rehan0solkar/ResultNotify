import mongoose from "mongoose";
import Favorite from "../server/models/Favorite.js";

const MONGO_URI = process.env.MONGO_URI;

if (!mongoose.connections[0].readyState) {
  await mongoose.connect(MONGO_URI);
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { email } = req.query;

      const favorites = await Favorite.find({
        userEmail: email,
      }).sort({ createdAt: -1 });

      return res.status(200).json(favorites);
    }

    if (req.method === "POST") {
      const existingFavorite =
  await Favorite.findOne({
    userEmail: req.body.userEmail,
    pdfUrl: req.body.pdfUrl,
  });

if (existingFavorite) {
  return res.status(409).json({
    message: "Already saved",
  });
}
      const favorite = await Favorite.create(req.body);

      return res.status(201).json({
        favorite,
      });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
  return res.status(400).json({
    message: "Missing favorite id",
  });
}

await Favorite.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Favorite removed",
      });
    }

    return res.status(405).json({
      message: "Method not allowed",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}