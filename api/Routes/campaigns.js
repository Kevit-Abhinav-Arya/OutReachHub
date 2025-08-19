const express = require('express');
const { verifyToken, requireViewer, requireEditor } = require('../Middleware/authMiddleware');
const {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  copyCampaign,
  launchCampaign,
} = require('../Controllers/campaignController');

const router = express.Router();

// All campaign routes require authentication
router.use(verifyToken);

// Campaign CRUD
router.post('/', requireEditor, createCampaign);
router.get('/', requireViewer, getAllCampaigns);
router.get('/:id', requireViewer, getCampaignById);
router.put('/:id', requireEditor, updateCampaign);
router.delete('/:id', requireEditor, deleteCampaign);

// Campaign Action
router.post('/:id/copy', requireEditor, copyCampaign);
router.post('/:id/launch', requireEditor, launchCampaign);

module.exports = router;
