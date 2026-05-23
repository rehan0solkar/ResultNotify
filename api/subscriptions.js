import { connectDB } from "../lib/db.js";
import Subscription from "../models/Subscription.js";

const MONGO_URI = process.env.MONGO_URI;

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === "GET") {

      const { email } = req.query;

      if (!email) {
        return res.status(200).json([]);
      }

      const subscriptions =
        await Subscription.find({
          userEmail: email,
        });

      return res.status(200).json(
        subscriptions || []
      );
    }

    if (req.method === "POST") {
      const existingSubscription =
  await Subscription.findOne({
    userEmail: req.body.userEmail,
    course: req.body.course,
    semester: req.body.semester,
  });

if (existingSubscription) {
  return res.status(409).json({
    message: "Already subscribed",
  });
}
      const subscription =
        await Subscription.create(req.body);

      return res.status(201).json({
        subscription,
      });
    }

    if (req.method === "DELETE") {

      const { id } = req.query;

      await Subscription.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Deleted",
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