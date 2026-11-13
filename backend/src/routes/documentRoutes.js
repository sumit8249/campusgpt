const express = require("express");
const multer = require("multer");
const {
  uploadDocument,
  getDocuments,
  removeDocument,
  getAnalytics,
} = require("../controllers/documentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
});

router.use(protect);

router.get("/", getDocuments);
router.post("/upload", adminOnly, upload.single("file"), uploadDocument);
router.delete("/:id", adminOnly, removeDocument);
router.get("/analytics", adminOnly, getAnalytics);

module.exports = router;
