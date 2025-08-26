import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  workspaceQueries,
  workspaceUserQueries,
  userAuthQueries,
} from "../MODELS/queries";
import { PaginatedResponse } from "../../types/types";

// Create workspace
export const createWorkspace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: "Workspace name is required" });
      return;
    }

    const workspaceData = {
      _id: new mongoose.Types.ObjectId(),
      name: name.trim(),
    };

    const workspace = await workspaceQueries.createWorkspace(
      workspaceData as any
    );

    res.status(201).json({
      message: "Workspace created successfully",
      workspace: {
        id: workspace._id,
        name: workspace.name,
        createdAt: workspace.createdAt,
      },
    });
  } catch (error) {
    console.error("Create workspace error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all workspaces
export const getAllWorkspaces = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = "1", limit = "10", search = "" } = req.query;

    const { workspaces, total } = await workspaceQueries.listWorkspaces({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
    });

    const workspacesResponse = workspaces.map((workspace) => ({
      id: workspace._id.toString(),
      name: workspace.name,
      createdAt: workspace.createdAt,
    }));

    const response: PaginatedResponse<(typeof workspacesResponse)[0]> = {
      data: workspacesResponse,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalItems: total,
        limit: parseInt(limit as string),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get workspaces error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get workspace by ID
export const getWorkspaceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid workspace ID" });
      return;
    }

    const workspace = await workspaceQueries.getWorkspaceById(id);

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Get workspace users count
    const usersCount = await workspaceUserQueries.getWorkspaceUsersCount(id);
    const { users } = await workspaceUserQueries.listWorkspaceUsers(id);

    res.json({
      workspace: {
        id: workspace._id,
        name: workspace.name,
        createdAt: workspace.createdAt,
        user: users.map((data: any) => ({
          id: data._id,
          email: data.email,
          name: data.name,
          createdAt: data.createdAt,
        })),
        usersCount,
      },
    });
  } catch (error) {
    console.error("Get workspace error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update workspace
export const updateWorkspace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid workspace ID" });
      return;
    }

    if (!name) {
      res.status(400).json({ message: "Workspace name is required" });
      return;
    }

    const workspace = await workspaceQueries.updateWorkspace(id, {
      name: name.trim(),
    } as any);

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.json({
      message: "Workspace updated successfully",
      workspace: {
        id: workspace._id,
        name: workspace.name,
        createdAt: workspace.createdAt,
      },
    });
  } catch (error) {
    console.error("Update workspace error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete workspace
export const deleteWorkspace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid workspace ID" });
      return;
    }

    const workspace = await workspaceQueries.getWorkspaceById(id);
    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const { users } = await workspaceUserQueries.listWorkspaceUsers(id);

    if (users.length > 0) {
      const removeUserPromises = users.map(async (user) => {
        try {
          await workspaceUserQueries.removeUserFromWorkspace(
            user._id.toString(),
            id
          );
          console.log(
            `User ${user.name} removed from workspace ${workspace.name} successfully`
          );
        } catch (error) {
          console.error(
            `Error removing user ${user.name} from workspace:`,
            error
          );
        }
      });

      await Promise.all(removeUserPromises);
      console.log("All users removed from workspace successfully");
    }

    const deletedWorkspace = await workspaceQueries.deleteWorkspace(id);

    if (!deletedWorkspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    res.json({
      message: `Workspace '${workspace.name}' and all associated users deleted successfully`,
    });
  } catch (error) {
    console.error("Delete workspace error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create workspace user
export const createWorkspaceUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { email, password, name, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({ message: "Invalid workspace ID" });
      return;
    }

    if (!email || !password || !name || !role) {
      res.status(400).json({
        message: "Email, password, name, and role are required",
      });
      return;
    }

    if (!["Editor", "Viewer"].includes(role)) {
      res.status(400).json({
        message: "Role must be either Editor or Viewer",
      });
      return;
    }

    // Check if workspace exists
    const workspace = await workspaceQueries.getWorkspaceById(workspaceId);

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    // Check if user already exists
    const existingUser = await userAuthQueries.findUserByEmail(email);

    let user: any;

    if (existingUser) {
      const isUserInWorkspace = (existingUser as any).workspaces.some(
        (w: any) => w.workspaceId._id.toString() === workspaceId
      );

      if (isUserInWorkspace) {
        res.status(400).json({
          message: "User is already a member of this workspace",
        });
        return;
      }

      // Add user to workspace
      user = await workspaceUserQueries.addUserToWorkspace(
        existingUser._id.toString(),
        workspaceId,
        workspace.name,
        role
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user and add to workspace
      user = await workspaceUserQueries.createWorkspaceUser({
        email,
        password: hashedPassword,
        name,
        workspaceId,
        workspaceName: workspace.name,
        role,
      } as any);
    }

    res.status(201).json({
      message: `User ${existingUser ? "added to" : "created and added to"} workspace ${workspace.name} successfully`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: "User with this email already exists" });
      return;
    }
    console.error("Create workspace user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get workspace users
export const getWorkspaceUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { page = "1", limit = "10" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({ message: "Invalid workspace ID" });
      return;
    }

    const { users, total } = await workspaceUserQueries.listWorkspaceUsers(
      workspaceId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      users: users.map((user: any) => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.workspaces.find(
          (w: any) => w.workspaceId.toString() === workspaceId
        )?.role,
        createdAt: user.createdAt,
      })),
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
        totalItems: total,
        limit: parseInt(limit as string),
      },
    });
  } catch (error) {
    console.error("Get workspace users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get workspace user by ID
export const getWorkspaceUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(workspaceId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      res.status(400).json({ message: "Invalid workspace or user ID" });
      return;
    }

    const user = await workspaceUserQueries.getWorkspaceUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found in this workspace" });
      return;
    }

    // Check if user has access to this workspace
    const workspaceAccess = (user as any).workspaces.find(
      (w: any) => w.workspaceId._id.toString() === workspaceId
    );

    if (!workspaceAccess) {
      res.status(404).json({ message: "User not found in this workspace" });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: workspaceAccess.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get workspace user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update workspace user
export const updateWorkspaceUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId, userId } = req.params;
    const { name, role } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(workspaceId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      res.status(400).json({ message: "Invalid workspace or user ID" });
      return;
    }

    if (role && !["Editor", "Viewer"].includes(role)) {
      res.status(400).json({
        message: "Role must be either Editor or Viewer",
      });
      return;
    }

    const user = await workspaceUserQueries.updateWorkspaceUser(
      userId,
      workspaceId,
      {
        name,
        role,
      } as any
    );

    if (!user) {
      res.status(404).json({ message: "User not found in this workspace" });
      return;
    }

    const workspaceAccess = (user as any).workspaces.find(
      (w: any) => w.workspaceId._id.toString() === workspaceId
    );

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: workspaceAccess.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update workspace user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete workspace user
export const deleteWorkspaceUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(workspaceId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      res.status(400).json({ message: "Invalid workspace or user ID" });
      return;
    }

    const result = await workspaceUserQueries.removeUserFromWorkspace(
      userId,
      workspaceId
    );
    const user = await workspaceUserQueries.getWorkspaceUserById(userId);
    const workspace = await workspaceQueries.getWorkspaceById(workspaceId);

    if (!result) {
      res.status(404).json({ message: "User not found in this workspace" });
      return;
    }

    res.json({
      message: `User: ${user?.name} removed from workspace: ${workspace?.name} successfully`,
    });
  } catch (error) {
    console.error("Delete workspace user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
