import { connectDB } from "../lib/db.js";
import Notification from "../server/models/Notification.js";

export default async function handler(req, res) {
  try {
    await connectDB();

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