const express = require('express');
const { verifyToken, requireAdmin } = require('../Middleware/authMiddleware');
const {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  createWorkspaceUser,
  getWorkspaceUsers,
  getWorkspaceUserById,
  updateWorkspaceUser,
  deleteWorkspaceUser
} = require('../Controllers/workspaceController');

const router = express.Router();

router.use(verifyToken, requireAdmin);

// Workspace
router.post('/', createWorkspace);
router.get('/', getAllWorkspaces);
router.get('/:id', getWorkspaceById);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

// Workspace Users
router.post('/:workspaceId/users', createWorkspaceUser);
router.get('/:workspaceId/users', getWorkspaceUsers);
router.get('/:workspaceId/users/:userId', getWorkspaceUserById);
router.put('/:workspaceId/users/:userId', updateWorkspaceUser);
router.delete('/:workspaceId/users/:userId', deleteWorkspaceUser);

module.exports = router;
