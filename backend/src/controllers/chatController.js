const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { answerCollegeQuery } = require("../services/ragService");

async function askQuestion(req, res, next) {
  try {
    const { question, departmentFilter = "All", conversationId } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question text is required." });
    }

    let conversation = null;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId: req.user._id });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId: req.user._id,
        title: question.trim().slice(0, 60),
        departmentFilter,
      });
    } else {
      conversation.departmentFilter = departmentFilter;
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    const history = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: question.trim(),
    });

    const ragResult = await answerCollegeQuery(question.trim(), departmentFilter, history);

    const assistantMsg = await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: ragResult.answer,
      sources: ragResult.sources,
      confidenceScore: ragResult.confidenceScore,
      isUnknown: ragResult.isUnknown,
    });

    res.json({
      conversationId: conversation._id,
      messageId: assistantMsg._id,
      answer: assistantMsg.content,
      sources: assistantMsg.sources,
      confidenceScore: assistantMsg.confidenceScore,
      isUnknown: assistantMsg.isUnknown,
    });
  } catch (err) {
    next(err);
  }
}

async function getConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

async function getConversationMessages(req, res, next) {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ conversation, messages });
  } catch (err) {
    next(err);
  }
}

async function deleteConversation(req, res, next) {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (conversation) {
      await Message.deleteMany({ conversationId: conversation._id });
    }
    res.json({ message: "Conversation deleted." });
  } catch (err) {
    next(err);
  }
}

async function submitFeedback(req, res, next) {
  try {
    const { feedback } = req.body;
    if (!["up", "down", null].includes(feedback)) {
      return res.status(400).json({ message: "Invalid feedback value." });
    }
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { feedback },
      { new: true }
    );
    if (!msg) {
      return res.status(404).json({ message: "Message not found." });
    }
    res.json({ message: "Feedback recorded.", feedback: msg.feedback });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  askQuestion,
  getConversations,
  getConversationMessages,
  deleteConversation,
  submitFeedback,
};
