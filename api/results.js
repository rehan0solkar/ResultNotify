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
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGO_URI);
  } 

    const results =
  await Result.find()
    .sort({ _id: -1 })
    .lean();

    res.status(200).json(results);

  } catch (error) {
  console.error(error);
  return res.status(500).json({
    error: error.message,
  });
}
}