const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  title: String,
  date: String,
  pdfUrl: {
    type: String,
    unique: true,
  },
});
export default mongoose.models.Result || mongoose.model("Result",ResultSchema);