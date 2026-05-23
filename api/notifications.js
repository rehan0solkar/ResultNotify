import mongoose from "mongoose";
import Notification from "../models/Notification.js";

const MONGO_URI = process.env.MONGO_URI;

export default async function handler(req, res) {
  try {
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  }

    if (req.method === "GET") {
      const { email } = req.query;

      if (!email) {
        return res.status(200).json([]);
      }

      const notifications =
      await Notification.find({
        userEmail: email,
      }).sort({ createdAt: -1 });

      return res.status(200).json(
        notifications
      );
    }

    if (req.method === "POST") {

      const notification =
        await Notification.create(req.body);

      return res.status(201).json({
        notification,
      });
    }

    return res.status(405).json({
      message: "Method not allowed",
    });

  } catch (error) {
  console.error(error);
  return res.status(500).json({
    error: error.message,
  });
}
}