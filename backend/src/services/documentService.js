const pdfParse = require("pdf-parse");
const Document = require("../models/Document");
const DocumentChunk = require("../models/DocumentChunk");
const { chunkText, generateEmbedding } = require("./ragService");

async function ingestDocument({ file, title, department, userId }) {
  let rawText = "";

  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    const parsed = await pdfParse(file.buffer);
    rawText = parsed.text || "";
  } else {
    rawText = file.buffer.toString("utf-8");
  }

  if (!rawText || rawText.trim().length < 20) {
    throw new Error("Could not extract readable text from the uploaded file. Ensure it is not a blank or image-only PDF.");
  }

  const doc = await Document.create({
    title: (title || file.originalname).trim(),
    fileName: file.originalname,
    department: department || "General",
    uploadedBy: userId,
    status: "processing",
  });

  try {
    const chunks = chunkText(rawText);
    const chunkDocs = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      chunkDocs.push({
        documentId: doc._id,
        documentTitle: doc.title,
        department: doc.department,
        chunkIndex: i,
        content: chunks[i],
        embedding,
      });
    }

    if (chunkDocs.length > 0) {
      await DocumentChunk.insertMany(chunkDocs);
    }

    doc.chunkCount = chunkDocs.length;
    doc.status = "indexed";
    await doc.save();

    return doc;
  } catch (err) {
    doc.status = "failed";
    await doc.save();
    throw err;
  }
}

async function listDocuments() {
  return Document.find().populate("uploadedBy", "name email").sort({ createdAt: -1 }).lean();
}

async function deleteDocumentAndChunks(documentId) {
  await DocumentChunk.deleteMany({ documentId });
  await Document.findByIdAndDelete(documentId);
}

module.exports = {
  ingestDocument,
  listDocuments,
  deleteDocumentAndChunks,
};
