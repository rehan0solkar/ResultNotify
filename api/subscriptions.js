const express = require("express");
const router = express.Router();

const Subscription = require("../models/Subscription");

// GET subscriptions
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;

    const subscriptions = await Subscription.find({
      userEmail: email,
    });

    res.json(subscriptions);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subscriptions",
    });
  }
});

// POST subscription
router.post("/", async (req, res) => {
  try {

    const { userEmail, course, semester } = req.body;

    const existingSubscription =
      await Subscription.findOne({
        userEmail,
        course,
        semester,
      });

    if (existingSubscription) {
      return res.status(400).json({
        message: "Already subscribed",
      });
    }

    const subscription =
      await Subscription.create({
        userEmail,
        course,
        semester,
      });

    res.status(201).json({
      subscription,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create subscription",
    });
  }
});

// DELETE subscription
router.delete("/", async (req, res) => {
  try {

    const { id } = req.query;

    await Subscription.findByIdAndDelete(id);

    res.json({
      message: "Subscription removed",
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to remove subscription",
    });
  }
});

module.exports = router;
