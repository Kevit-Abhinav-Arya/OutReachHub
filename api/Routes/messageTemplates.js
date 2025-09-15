const express = require("express");
const {
  verifyToken,
  requireViewer,
  requireEditor,
} = require("../Middleware/authMiddleware");
const {
  createMessageTemplate,
  getAllMessageTemplates,
  getMessageTemplateById,
  updateMessageTemplate,
  deleteMessageTemplate,
} = require("../Controllers/messageTemplateController");

const router = express.Router();

// All message template routes require authentication
router.use(verifyToken);

// Message Template CRUD
router.post("/", requireEditor, createMessageTemplate);
router.get("/", requireViewer, getAllMessageTemplates);
router.get("/:id", requireViewer, getMessageTemplateById);
router.put("/:id", requireEditor, updateMessageTemplate);
router.delete("/:id", requireEditor, deleteMessageTemplate);

module.exports = router;
