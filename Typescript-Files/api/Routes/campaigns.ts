import express from "express";
import {
  verifyToken,
  requireViewer,
  requireEditor,
} from "../Middlewares/authMiddleware";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  copyCampaign,
  launchCampaign,
} from "../Controller/campaignController";

const router = express.Router();

// All campaign routes require authentication
router.use(verifyToken);

// Campaign CRUD
router.post("/", requireEditor, createCampaign);
router.get("/", requireViewer, getAllCampaigns);
router.get("/:id", requireViewer, getCampaignById);
router.put("/:id", requireEditor, updateCampaign);
router.delete("/:id", requireEditor, deleteCampaign);

// Campaign Actions
router.post("/:id/copy", requireEditor, copyCampaign);
router.post("/:id/launch", requireEditor, launchCampaign);

export default router;
