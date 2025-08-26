import express from "express";
import { verifyToken, requireAdmin } from "../Middlewares/authMiddleware";
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  createWorkspaceUser,
  getWorkspaceUsers,
  getWorkspaceUserById,
  updateWorkspaceUser,
  deleteWorkspaceUser,
} from "../Controller/workspaceController";

const router = express.Router();

// All workspace routes require admin authentication
router.use(verifyToken, requireAdmin);

// Workspace CRUD
router.post("/", createWorkspace);
router.get("/", getAllWorkspaces);
router.get("/:id", getWorkspaceById);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);

// Workspace Users CRUD
router.post("/:workspaceId/users", createWorkspaceUser);
router.get("/:workspaceId/users", getWorkspaceUsers);
router.get("/:workspaceId/users/:userId", getWorkspaceUserById);
router.put("/:workspaceId/users/:userId", updateWorkspaceUser);
router.delete("/:workspaceId/users/:userId", deleteWorkspaceUser);

export default router;
