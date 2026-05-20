import mongoose from "mongoose";
import Subscription from "../server/models/Subscription.js";

const MONGO_URI = process.env.MONGO_URI;

if (!mongoose.connections[0].readyState) {
  await mongoose.connect(MONGO_URI);
}

export default async function handler(req, res) {

  try {

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

    console.log(error);

    return res.status(500).json({
      message: error.message,
    });
  }
}