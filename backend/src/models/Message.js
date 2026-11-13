const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    documentTitle: String,
    department: String,
    excerpt: String,
    score: Number,
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sources: {
    type: [sourceSchema],
    default: [],
  },
  confidenceScore: {
    type: Number,
    default: null,
  },
  isUnknown: {
    type: Boolean,
    default: false,
  },
  feedback: {
    type: String,
    enum: ["up", "down", null],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
