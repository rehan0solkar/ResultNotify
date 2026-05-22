import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  title: String,
  date: String,
  pdfUrl: String,
});

const Result =
  mongoose.models.Result ||
  mongoose.model(
    "Result",
    ResultSchema
  );

export default async function handler(
  req,
  res
) {

  try {

    if (
      mongoose.connection.readyState
      !== 1
    ) {

      await mongoose.connect(
        process.env.MONGO_URI
      );
    }

    const results =
  await Result.find()
    .sort({ _id: -1 })
    .lean();

    res.status(200).json(results);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
}