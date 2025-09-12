import express from "express";
import {
  verifyToken,
  requireViewer,
  requireEditor,
} from "../Middlewares/authMiddleware";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../Controller/contactController";

const router = express.Router();

router.use(verifyToken);

// Contact CRUD
router.post("/", requireEditor, createContact);
router.get("/", requireViewer, getAllContacts);
router.get("/:id", requireViewer, getContactById);
router.put("/:id", requireEditor, updateContact);
router.delete("/:id", requireEditor, deleteContact);

export default router;
