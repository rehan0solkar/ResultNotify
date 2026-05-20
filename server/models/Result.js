const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  title: String,
  date: String,
  pdfUrl: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model(
  "Result",
  ResultSchema
);