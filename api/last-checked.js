import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "lastchecked.json");
export default function handler(req, res) {

  try {

    const filePath = path.join(
      process.cwd(),
      "data",
      "lastChecked.json"
    );

    const data = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    res.status(200).json(data);

  } catch (error) {

    res.status(500).json({
      error: "Failed to load last checked time",
    });
  }
}