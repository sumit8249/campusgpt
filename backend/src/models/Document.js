const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    enum: ["General", "Admissions", "Academics", "Exams", "Hostel", "Placements", "Library"],
    default: "General",
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chunkCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["processing", "indexed", "failed"],
    default: "processing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Document", documentSchema);
