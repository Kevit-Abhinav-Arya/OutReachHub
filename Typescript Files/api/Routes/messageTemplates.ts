import express from "express";
import {
  verifyToken,
  requireViewer,
  requireEditor,
} from "../Middlewares/authMiddleware";
import {
  createMessageTemplate,
  getAllMessageTemplates,
  getMessageTemplateById,
  updateMessageTemplate,
  deleteMessageTemplate,
} from "../Controller/messageTemplateController";

const router = express.Router();

// All message template routes require authentication
router.use(verifyToken);

// Message Template CRUD
router.post("/", requireEditor, createMessageTemplate);
router.get("/", requireViewer, getAllMessageTemplates);
router.get("/:id", requireViewer, getMessageTemplateById);
router.put("/:id", requireEditor, updateMessageTemplate);
router.delete("/:id", requireEditor, deleteMessageTemplate);

export default router;
