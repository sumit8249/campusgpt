const express = require("express");
const {
  askQuestion,
  getConversations,
  getConversationMessages,
  deleteConversation,
  submitFeedback,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/ask", askQuestion);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversationMessages);
router.delete("/conversations/:id", deleteConversation);
router.post("/messages/:id/feedback", submitFeedback);

module.exports = router;
