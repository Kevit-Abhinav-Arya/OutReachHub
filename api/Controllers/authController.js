const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require("jwt-decode");
const { adminQueries, userAuthQueries } = require("../MODELS/queries");

// Generate JWT Token
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await adminQueries.findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: "admin",
      type: "admin",
    });

    res.json({
      message: "Login successful",
      token,
      ExpiresIn: token.expiresIn,
      user: {
        id: admin._id,
        email: admin.email,
        role: "admin",
        type: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500);
  }
};

// Workspace User Login
// checking if user is assosciated with more than one workspace
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await userAuthQueries.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.workspaces.length === 0) {
      return res
        .status(403)
        .json({ message: "No workspaces assigned to this user" });
    }

    // If user has only one workspace, automatically selecting it
    if (user.workspaces.length === 1) {
      const selectedWorkspace = user.workspaces[0].workspaceId;
      const userRole = user.workspaces[0].role;

      //Generating token with the workspace id
      const token = generateToken({
        id: user._id,
        email: user.email,
        name: user.name,
        workspaceId: selectedWorkspace._id,
        workspace: selectedWorkspace,
        role: userRole,
        type: "user",
      });

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          workspaceId: selectedWorkspace._id,
          workspaceName: selectedWorkspace.name,
          role: userRole,
          type: "user",
        },
      });
    }

    const availableWorkspaces = user.workspaces.map((w) => ({
      workspaceId: w.workspaceId._id,
      name: w.workspaceId.name,
      role: w.role,
    }));

    // Generating a temporary token for selecting the workspace because without it the user can access a workspace with just workspace-id
    const tempToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        type: "temp",
      },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );
    res.json({
      message:
        "Multiple workspaces found. Please select a workspace within 5 minutes",
      tempToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: "user",
      },
      availableWorkspaces,
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500);
  }
};

//WorkSpace Selection
const selectWorkspace = async (req, res) => {
  try {
    const { tempToken, workspaceId } = req.body;

    if (!tempToken || !workspaceId) {
      return res
        .status(400)
        .json({ message: "Temporary token and workspaceId are required" });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwtDecode(tempToken);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Temporary token expired. Please login again." });
      }
      return res.status(401).json({ message: "Invalid temporary token" });
    }

    if (decoded.type !== "temp") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await userAuthQueries.findUserByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const workspaceAccess = user.workspaces.find(
      (w) => w.workspaceId._id.toString() === workspaceId
    );
    if (!workspaceAccess) {
      return res
        .status(403)
        .json({ message: "Access denied to this workspace" });
    }

    const selectedWorkspace = workspaceAccess.workspaceId;
    const userRole = workspaceAccess.role;
    // Generate token for the selected workspace
    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
      workspaceId: selectedWorkspace._id,
      workspace: selectedWorkspace,
      role: userRole,
      type: "user",
    });

    res.json({
      message: "Workspace selected successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        workspaceId: selectedWorkspace._id,
        workspace: selectedWorkspace,
        role: userRole,
        type: "user",
      },
    });
  } catch (error) {
    console.error("Workspace selection error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout (just a message, will implement in nest js )
const logout = async (req, res) => {
  try {
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  adminLogin,
  userLogin,
  selectWorkspace,
  logout,
};
