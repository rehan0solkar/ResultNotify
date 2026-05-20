const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const Favorite = require("./models/Favorite");
const Subscription = require("./models/Subscription");
const Notification = require("./models/Notification");
const Result = require("./models/Result");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const transporter =
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));
app.use(cors());
app.use(express.json());
const scrapeResults = async () => {
  const urls = [
    "https://www.mumresults.in/",
    "https://www.mumresults.in/ugnepresults.html",
    "https://www.mumresults.in/revalresults.html",
    "https://www.mumresults.in/grievance_sh25/index.html",
  ];

  const results = [];

  for (const url of urls) {
  try {

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    $(".tablecontents table tbody tr").each(
      (index, row) => {

        const date = $(row)
          .find("td")
          .last()
          .text()
          .trim();

        $(row)
          .find("a")
          .each((i, linkElement) => {

            const title = $(linkElement)
              .text()
              .trim();

            const link = $(linkElement)
              .attr("href");

            if (
              link &&
              link.includes(".pdf")
            ) {

              results.push({
                title,
                date,
                pdfUrl: link.startsWith("http")
                  ? link
                  : `https://www.mumresults.in/${link}`,
              });

            }
          });
      }
    );

  } catch (error) {

    console.log(
      `Failed scraping ${url}:`,
      error.message
    );

  }
}

  return results;
};
app.get("/api/results", async (req, res) => {

  try {

    const results =
      await Result.find().sort({
        _id: -1,
      });

    res.json(results);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
app.post("/api/favorites", async (req, res) => {
  try {
    const existingFavorite = await Favorite.findOne({
      pdfUrl: req.body.pdfUrl,
      userEmail: req.body.userEmail,
    });

    if (existingFavorite) {
      await Favorite.findByIdAndDelete(
        existingFavorite._id
      );

      return res.json({
        message: "Favorite removed",
      });
    }

    const favorite = new Favorite(req.body);

    await favorite.save();

    res.status(201).json({
      message: "Favorite saved",
      favorite,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving favorite",
    });
  }
});
app.get("/api/favorites", async (req, res) => {
  try {
    const favorites = await Favorite.find({
      userEmail: req.query.email,
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching favorites",
    });
  }
});
app.delete("/api/favorites/:id", async (req, res) => {
  try {
    await Favorite.findByIdAndDelete(req.params.id);

    res.json({
      message: "Favorite deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting favorite",
    });
  }
});
app.post(
  "/api/subscriptions",
  async (req, res) => {
    try {
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
        new Subscription({
          userEmail,
          course,
          semester,
        });

      await subscription.save();

      res.status(201).json({
        message:
          "Subscription saved",
        subscription,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Error saving subscription",
      });
    }
  }
);
app.get(
  "/api/subscriptions",
  async (req, res) => {
    try {
      const subscriptions =
        await Subscription.find({
          userEmail:
            req.query.email,
        });

      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({
        message:
          "Error fetching subscriptions",
      });
    }
  }
);
let previousResults = [];
const sendEmailNotification =
  async (to, subject, text) => {
    try {
      await transporter.sendMail({
        from: `"ResultNotify" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
      });

      console.log(
        `Email sent to ${to}`
      );
    } catch (error) {
      console.log(error);
    }
  };
  const initializeResults =
  async () => {

    previousResults =
      await scrapeResults();

  };
  initializeResults();
cron.schedule("*/5 * * * *", async () => {
  console.log(
    "Checking for new results..."
  );

  try {
    const latestResults =
      await scrapeResults();

      for (const result of latestResults) {
        const existingResult =
        await Result.findOne({
          pdfUrl: result.pdfUrl,
        });

        if (!existingResult) {

          await Result.create(result);

          console.log(
            "New result saved to database"
          );
        }
      }
      if (previousResults.length === 0) {
        previousResults = latestResults;
        return;
      }
    const newResults =
      latestResults.filter(
        (result) =>
          !previousResults.some(
            (oldResult) =>
              oldResult.pdfUrl ===
            result.pdfUrl
          )
      );

    if (newResults.length > 0) {
      console.log(
        "New Results Found:",
        newResults.length
      );
      const subscriptions =
        await Subscription.find();
        

      for (const result of newResults) {
        
        for (const subscription of subscriptions) {
          
          const normalize = (text = "") =>
            text
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();
          
          const matchesCourse =
          normalize(result.title).includes(
            normalize(subscription.course)
          );

          const semesterRegex = new RegExp(
            `SEM(ESTER)?\\s*[-(]?\\s*${subscription.semester}`,
            "i"
          );
          
          const matchesSemester =
          semesterRegex.test(result.title);
          if (
            matchesCourse &&  
            matchesSemester
          ) {
            const existingNotification =
            await Notification.findOne({
              pdfUrl: result.pdfUrl,
            });
            if (!existingNotification) {
              await Notification.create({
                title: result.title,
                date: result.date,
                pdfUrl: result.pdfUrl,
              });
            }
            await sendEmailNotification(
              subscription.userEmail,
              "New Mumbai University Result Published",
              `
              A new result matching your subscription was found.
              Result:
              ${result.title}
              Date:
              ${result.date}
              PDF:
              ${result.pdfUrl}
              `
            );
          }
        }
      }
      
    }
    previousResults = latestResults;
  } catch (error) {
    console.log(error);
  }
});
app.delete(
  "/api/subscriptions/:id",
  async (req, res) => {
    try {
      await Subscription.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Subscription removed",
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Error removing subscription",
      });
    }
  }
);
app.get("/api/notifications", async (req, res) => {
  try {

    const notifications = await Notification
      .find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);

  } catch (error) {

    res.status(500).json({
      message: "Error fetching notifications",
    });

  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});