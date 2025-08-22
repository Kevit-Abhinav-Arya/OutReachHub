const express = require("express");
const {
  verifyToken,
  requireViewer,
  requireEditor,
} = require("../Middleware/authMiddleware");
const {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require("../Controllers/contactController");

const router = express.Router();

router.use(verifyToken);

// Contact CRUD
router.post("/", requireEditor, createContact);
router.get("/", requireViewer, getAllContacts);
router.get("/:id", requireViewer, getContactById);
router.put("/:id", requireEditor, updateContact);
router.delete("/:id", requireEditor, deleteContact);

module.exports = router;
