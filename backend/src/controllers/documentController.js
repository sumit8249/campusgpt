const Document = require("../models/Document");
const DocumentChunk = require("../models/DocumentChunk");
const Message = require("../models/Message");
const User = require("../models/User");
const {
  ingestDocument,
  listDocuments,
  deleteDocumentAndChunks,
} = require("../services/documentService");

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please attach a PDF, TXT, or MD file." });
    }

    const { title, department } = req.body;
    const doc = await ingestDocument({
      file: req.file,
      title,
      department,
      userId: req.user._id,
    });

    res.status(201).json({
      message: "Document processed and indexed into vector knowledge base.",
      document: doc,
    });
  } catch (err) {
    next(err);
  }
}

async function getDocuments(req, res, next) {
  try {
    const documents = await listDocuments();
    res.json({ documents });
  } catch (err) {
    next(err);
  }
}

async function removeDocument(req, res, next) {
  try {
    await deleteDocumentAndChunks(req.params.id);
    res.json({ message: "Document and associated vector chunks removed." });
  } catch (err) {
    next(err);
  }
}

async function getAnalytics(req, res, next) {
  try {
    const [
      totalDocuments,
      totalChunks,
      totalUsers,
      totalAssistantReplies,
      unknownReplies,
      positiveFeedback,
      negativeFeedback,
      deptBreakdown,
      recentUnanswered,
    ] = await Promise.all([
      Document.countDocuments({ status: "indexed" }),
      DocumentChunk.countDocuments(),
      User.countDocuments(),
      Message.countDocuments({ role: "assistant" }),
      Message.countDocuments({ role: "assistant", isUnknown: true }),
      Message.countDocuments({ role: "assistant", feedback: "up" }),
      Message.countDocuments({ role: "assistant", feedback: "down" }),
      Document.aggregate([
        { $match: { status: "indexed" } },
        {
          $group: {
            _id: "$department",
            documents: { $sum: 1 },
            chunks: { $sum: "$chunkCount" },
          },
        },
        { $sort: { chunks: -1 } },
      ]),
      Message.find({ role: "user" }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const ratedTotal = positiveFeedback + negativeFeedback;
    const satisfactionRate =
      ratedTotal > 0 ? Math.round((positiveFeedback / ratedTotal) * 100) : 100;

    res.json({
      metrics: {
        totalDocuments,
        totalChunks,
        totalUsers,
        totalQueries: totalAssistantReplies,
        unknownQueries: unknownReplies,
        satisfactionRate,
        positiveFeedback,
        negativeFeedback,
      },
      deptBreakdown,
      recentQueries: recentUnanswered,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadDocument,
  getDocuments,
  removeDocument,
  getAnalytics,
};
