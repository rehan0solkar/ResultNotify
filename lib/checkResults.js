import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

import mongoose from "mongoose";
import { scrapeResults } from "./scraper.js";

import {
  sendResultNotification,
} from "./mailer.js";

import Result from "../models/Result.js";
import Subscription from "../models/Subscription.js";
import Notification from "../models/Notification.js";

const MONGO_URI = process.env.MONGO_URI;

await mongoose.connect(MONGO_URI);

export const checkResults = async () => {

  console.log("Checking results...");

  const scrapedResults =
    await scrapeResults();

  for (const result of scrapedResults) {

    const exists =
      await Result.findOne({
        pdfUrl: result.pdfUrl,
      });

    if (exists) {
      continue;
    }

    const newResult =
      await Result.create(result);

    console.log(
      "New result saved:",
      result.title
    );

    const subscriptions =
      await Subscription.find();

    for (const sub of subscriptions) {

      const keyword =
        sub.course?.toLowerCase();
      if (
        keyword &&
        result.title
        .toLowerCase()
        .includes(keyword)
      ) {
        await Notification.create({
  userEmail: sub.userEmail,

  title: "New Result Published",

  message: result.title,

  date: result.date,

  pdfUrl: result.pdfUrl,

  read: false,
});
try {
  await sendResultNotification(
    sub.userEmail,
    result.title
  );

  console.log(`Email sent to ${sub.userEmail}`);

} catch (err) {
  console.log("Mail error:", err.message);
}
        console.log(
          `Matched subscription for ${sub.userEmail}`
        );
      }
    }
  }

  console.log("Check complete");
  fs.writeFileSync(
  "./data/lastchecked.json",

  JSON.stringify(
    {
      lastChecked:
        new Date().toISOString(),
    },
    null,
    2
  )
);
  
  await mongoose.connection.close();
  process.exit(0);
};

checkResults();