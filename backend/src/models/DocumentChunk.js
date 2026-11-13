const mongoose = require("mongoose");

const documentChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
    index: true,
  },
  documentTitle: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    default: "General",
    index: true,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DocumentChunk", documentChunkSchema);
