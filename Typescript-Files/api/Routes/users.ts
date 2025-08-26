import express from "express";
import { verifyToken, requireAdmin } from "../Middlewares/authMiddleware";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignUserToWorkspace,
  removeUserFromWorkspace,
  getUsersNotInWorkspace,
} from "../Controller/userController";

const router = express.Router();

router.use(verifyToken, requireAdmin);

// User CRUD operations
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

// Workspace user operations
router.post("/:userId/workspaces/:workspaceId", assignUserToWorkspace);
router.delete("/:userId/workspaces/:workspaceId", removeUserFromWorkspace);

// Get users not in workspace (for assignment)
router.get("/not-in-workspace/:workspaceId", getUsersNotInWorkspace);

export default router;
