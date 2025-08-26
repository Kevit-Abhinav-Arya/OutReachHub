import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  userManagementQueries,
  workspaceUserQueries,
  workspaceQueries,
} from "../MODELS/queries";
import { PaginatedResponse } from "../../types/types";

// Create User
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: "Name, email, and password are required",
      });
      return;
    }

    const existingUser = await userManagementQueries.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        message: "User with this email already exists",
      });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
    };

    const newUser = await userManagementQueries.createUser(userData as any);

    const { ...userResponse } = (newUser as any).toObject();
    delete (userResponse as any).password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    let users: any[], totalUsers: number;

    if (search) {
      users = await userManagementQueries.searchUsers(search, page, limit);
      totalUsers = users.length;
    } else {
      users = await userManagementQueries.getAllUsers(page, limit);
      totalUsers = await userManagementQueries.getAllUsersCount();
    }

    const usersResponse = users.map((user) => {
      const userData = { ...(user as any).toObject() };
      delete (userData as any).password;
      return {
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email,
        workspaces: userData.workspaces,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };
    });

    const response: PaginatedResponse<(typeof usersResponse)[0]> = {
      data: usersResponse,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalItems: totalUsers,
        limit: limit,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User by ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await userManagementQueries.getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { ...userResponse } = (user as any).toObject();
    delete (userResponse as any).password;

    res.json({ user: userResponse });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update User
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, email, password } = req.body;

    const existingUser = await userManagementQueries.getUserById(userId);
    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();

    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await userManagementQueries.updateUser(
      userId,
      updateData
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User update failed" });
      return;
    }

    const { ...userResponse } = (updatedUser as any).toObject();
    delete (userResponse as any).password;

    res.json({
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete User
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const existingUser = await userManagementQueries.deleteUser(userId);
    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      message: `User: ${existingUser.name} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Assign User to Workspace
export const assignUserToWorkspace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, workspaceId } = req.params;
    const { role = "Viewer" } = req.body;

    if (!["Editor", "Viewer"].includes(role)) {
      res.status(400).json({
        message: "Role must be either Editor or Viewer",
      });
      return;
    }

    const user = await userManagementQueries.getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isAlreadyInWorkspace = (user as any).workspaces.some(
      (w: any) => w.workspaceId._id.toString() === workspaceId
    );

    if (isAlreadyInWorkspace) {
      res.status(409).json({
        message: "User is already assigned to this workspace",
      });
      return;
    }

    const workspace = await workspaceQueries.getWorkspaceById(workspaceId);

    if (!workspace) {
      res.status(404).json({ message: "Workspace not found" });
      return;
    }

    const updatedUser = await workspaceUserQueries.addUserToWorkspace(
      userId,
      workspaceId,
      workspace.name,
      role
    );

    if (!updatedUser) {
      res.status(500).json({ message: "Failed to assign user to workspace" });
      return;
    }

    res.json({
      message: "User assigned to workspace successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        workspaces: updatedUser.workspaces,
      },
    });
  } catch (error) {
    console.error("Assign user to workspace error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove User from Workspace
export const removeUserFromWorkspace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, workspaceId } = req.params;

    const user = await userManagementQueries.getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updatedUser = await workspaceUserQueries.removeUserFromWorkspace(
      userId,
      workspaceId
    );

    if (!updatedUser) {
      res.status(500).json({ message: "Failed to remove user from workspace" });
      return;
    }

    res.json({
      message: `User: ${user.name} removed from workspace successfully`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        workspaces: updatedUser.workspaces,
      },
    });
  } catch (error) {
    console.error("Remove user from workspace error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Users Not in Workspace (for workspace assignment)
export const getUsersNotInWorkspace = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.params;

    // Get all users and filter out those already in the workspace
    const allUsers = await userManagementQueries.getAllUsers();
    const users = allUsers.filter((user: any) => {
      return !user.workspaces.some(
        (w: any) => w.workspaceId._id.toString() === workspaceId
      );
    });

    res.json({
      users: users.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
      })),
    });
  } catch (error) {
    console.error("Get users not in workspace error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
