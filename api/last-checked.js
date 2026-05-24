import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "lastchecked.json"
    );

    if (!fs.existsSync(filePath)) {
      return res.status(200).json({
        lastChecked: "Never",
      });
    }

    const data = fs.readFileSync(filePath, "utf8");

    return res.status(200).json(JSON.parse(data));
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}