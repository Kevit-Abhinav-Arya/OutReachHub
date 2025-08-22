const bcrypt = require("bcryptjs");
const {
  userManagementQueries,
  workspaceUserQueries,
  workspaceQueries,
} = require("../MODELS/queries");

// Create User
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await userManagementQueries.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
    };

    const newUser = await userManagementQueries.createUser(userData);

    const { ...userResponse } = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    let users, totalUsers;

    if (search) {
      users = await userManagementQueries.searchUsers(search, page, limit);
      totalUsers = users.length;
    } else {
      users = await userManagementQueries.getAllUsers(page, limit);
      totalUsers = await userManagementQueries.getAllUsersCount();
    }

    // Remove passwords from response
    const usersResponse = users.map((user) => {
      const { ...userData } = user.toObject();
      delete userData.password;
      return userData;
    });

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: usersResponse,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get User by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userManagementQueries.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { ...userResponse } = user.toObject();
    delete userResponse.password;

    res.json({ user: userResponse });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, password } = req.body;

    const existingUser = await userManagementQueries.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
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

    const { ...userResponse } = updatedUser.toObject();
    delete userResponse.password;

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
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const existingUser = await userManagementQueries.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await userManagementQueries.deleteUser(userId);

    res.json({
      message: `User: ${existingUser.name} deleted succesfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Assign User to Workspace
const assignUserToWorkspace = async (req, res) => {
  try {
    const { userId, workspaceId } = req.params;
    const { role = "Viewer" } = req.body;

    if (!["Editor", "Viewer"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either Editor or Viewer",
      });
    }

    const user = await userManagementQueries.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAlreadyInWorkspace = user.workspaces.some(
      (w) => w.workspaceId._id.toString() === workspaceId
    );

    if (isAlreadyInWorkspace) {
      return res.status(409).json({
        message: "User is already assigned to this workspace",
      });
    }

    const workspace = await workspaceQueries.getWorkspaceById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const updatedUser = await workspaceUserQueries.addUserToWorkspace(
      userId,
      workspaceId,
      workspace.name,
      role
    );

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
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove User from Workspace
const removeUserFromWorkspace = async (req, res) => {
  try {
    const { userId, workspaceId } = req.params;

    const user = await userManagementQueries.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await workspaceUserQueries.removeUserFromWorkspace(
      userId,
      workspaceId
    );

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
const getUsersNotInWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const users =
      await userManagementQueries.getUsersNotInWorkspace(workspaceId);

    res.json({
      users: users.map((user) => ({
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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersNotInWorkspace,
  assignUserToWorkspace,
  removeUserFromWorkspace,
};
