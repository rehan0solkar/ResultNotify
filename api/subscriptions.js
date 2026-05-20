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

      const subscriptions =
        await Subscription.find({
          userEmail: email,
        });

      return res.status(200).json(
        subscriptions
      );
    }

    if (req.method === "POST") {

      const {
        userEmail,
        course,
        semester,
      } = req.body;

      const existingSubscription =
        await Subscription.findOne({
          userEmail,
          course,
          semester,
        });

      if (existingSubscription) {

        return res.status(400).json({
          message:
            "Already subscribed",
        });
      }

      const subscription =
        await Subscription.create({
          userEmail,
          course,
          semester,
        });

      return res.status(201).json({
        subscription,
      });
    }

    if (req.method === "DELETE") {

      const { id } = req.query;

      await Subscription.findByIdAndDelete(
        id
      );

      return res.status(200).json({
        message:
          "Subscription removed",
      });
    }

    return res.status(405).json({
      message:
        "Method not allowed",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}