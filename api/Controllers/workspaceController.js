const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { workspaceQueries, workspaceUserQueries, userAuthQueries } = require('../MODELS/queries');

// Create workspace
const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const workspaceData = { _id: new mongoose.Types.ObjectId(),name: name.trim(), };
    const workspace = await workspaceQueries.createWorkspace(workspaceData);

    res.status(201).json({
      message: 'Workspace created successfully',
      workspace: {
        id: workspace._id,
        name: workspace.name,
        createdAt: workspace.createdAt
      }
    });

  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all workspaces
const getAllWorkspaces = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const { workspaces, total } = await workspaceQueries.listWorkspaces({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    res.json({
      workspaces: workspaces.map(workspace => ({
        id: workspace._id,
        name: workspace.name,
        createdAt: workspace.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get workspace by ID
const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    const workspace = await workspaceQueries.getWorkspaceById(id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Get workspace users count
    const usersCount = await workspaceUserQueries.getWorkspaceUsersCount(id);
    const {users} = await workspaceUserQueries.listWorkspaceUsers(id);

    res.json({
      workspace: {
        id: workspace._id,
        name: workspace.name,
        createdAt: workspace.createdAt,
        user: users.map(data => ({
          id: data._id,
          email: data.email,
          name: data.name,
          createdAt: data.createdAt
        })),
        usersCount,
      
        
      },
    });

  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update workspace
const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const workspace = await workspaceQueries.updateWorkspace(id, { name: name.trim() });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.json({
      message: 'Workspace updated successfully',
      workspace: {
        id: workspace._id,
        name: workspace.name,
        createdAt: workspace.createdAt
      }
    });

  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete workspace
const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    // Check if workspace has users
    const usersCount = await workspaceUserQueries.getWorkspaceUsersCount(id);

    if (usersCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete workspace with existing users. Please remove all users first.' 
      });
    }

    const workspace = await workspaceQueries.deleteWorkspace(id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.json({ message: 'Workspace deleted successfully' });

  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create workspace user
const createWorkspaceUser = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, password, name, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    if (!email || !password || !name || !role) {
      return res.status(400).json({ 
        message: 'Email, password, name, and role are required' 
      });
    }

    if (!['Editor', 'Viewer'].includes(role)) {
      return res.status(400).json({ 
        message: 'Role must be either Editor or Viewer' 
      });
    }

    // Checking if workspace exists
    const workspace = await workspaceQueries.getWorkspaceById(workspaceId);
    

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Checking if user already exists
    const existingUser = await userAuthQueries.findUserByEmail(email);

    let user;
    
    if (existingUser) {
      const isUserInWorkspace = existingUser.workspaces.some(
        w => w.workspaceId.toString() === workspaceId
      );

      if (isUserInWorkspace) {
        return res.status(400).json({ 
          message: 'User is already a member of this workspace' 
        });
      }

      // Add user to workspace
      user = await workspaceUserQueries.addUserToWorkspace(existingUser._id, workspaceId, workspace.name , role);
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
        role
      });
    }

    res.status(201).json({
      message: `User ${existingUser ? 'added to' : 'created and added to'} workspace ${workspace.name} successfully`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    console.error('Create workspace user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get workspace users
const getWorkspaceUsers = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { page = 1, limit = 10} = req.query;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: 'Invalid workspace ID' });
    }

    const { users, total } = await workspaceUserQueries.listWorkspaceUsers(workspaceId, parseInt(page), parseInt(limit));

    res.json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.workspaces.find(w => w.workspaceId.toString() === workspaceId)?.role,
        createdAt: user.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get workspace users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get workspace user by ID
const getWorkspaceUserById = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid workspace or user ID' });
    }

    const user = await workspaceUserQueries.getWorkspaceUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found in this workspace' });
    }

    // Check if user has access to this workspace
    const workspaceAccess = user.workspaces.find(w => 
      w.workspaceId._id.toString() === workspaceId
    );

    if (!workspaceAccess) {
      return res.status(404).json({ message: 'User not found in this workspace' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: workspaceAccess.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get workspace user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update workspace user
const updateWorkspaceUser = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    const { name, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid workspace or user ID' });
    }

    if (role && !['Editor', 'Viewer'].includes(role)) {
      return res.status(400).json({ 
        message: 'Role must be either Editor or Viewer' 
      });
    }

    const user = await workspaceUserQueries.updateWorkspaceUser(userId, workspaceId, {
      name,
      role
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found in this workspace' });
    }

    const workspaceAccess = user.workspaces.find(w => 
      w.workspaceId._id.toString() === workspaceId
    );

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: workspaceAccess.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Update workspace user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete workspace user
const deleteWorkspaceUser = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid workspace or user ID' });
    }

    const result = await workspaceUserQueries.removeUserFromWorkspace(userId, workspaceId);
    const user = await workspaceUserQueries.getWorkspaceUserById(userId);
    const workspace = await workspaceQueries.getWorkspaceById(workspaceId);

    if (!result) {
      return res.status(404).json({ message: 'User not found in this workspace' });
    }

    res.json({ message: `User: ${user.name} removed from workspace: ${workspace.name} successfully` });

  } catch (error) {
    console.error('Delete workspace user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
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
};
