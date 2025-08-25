const { adminQueries, userAuthQueries } = require("../MODELS/queries");
const { jwtDecode } = require("jwt-decode");

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  try {
    console.log("Headers: ", req.headers.authorization);
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("No token found in authorization header");
      return res.status(401).json({ message: "Access token required" });
    }

    console.log("Token received:", token);

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return res.status(500).json({ message: "Server error" });
    }

    console.log("JWT_SECRET is present");
    const decoded = jwtDecode(token);
    console.log("Token decoded successfully:", {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
    });

    if (!decoded.id || !decoded.email || !decoded.type) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    let currentUser;
    if (decoded.type === "admin") {
      currentUser = await adminQueries.findAdminByEmail(decoded.email);
    } else if (decoded.type === "user") {
      currentUser = await userAuthQueries.findUserByEmail(decoded.email);

      if (decoded.workspaceId && currentUser) {
        const hasWorkspaceAccess = currentUser.workspaces.some(
          (w) => w.workspaceId._id.toString() === decoded.workspaceId
        );

        if (!hasWorkspaceAccess) {
          return res.status(403).json({ message: "Workspace access revoked" });
        }
      }
    } else {
      return res.status(401).json({ message: "Invalid user type in token" });
    }

    if (!currentUser) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attaching user info to the request
    req.user = decoded;
    req.currentUser = currentUser;
    next();
  } catch (error) {
    console.log("Token verification error:", error.message);
    console.log("Error name:", error.name);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Token verification failed" });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.type !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Check if user has editor role
const requireEditor = (req, res, next) => {
  if (req.user.type === "admin") {
    next(); // Admin can access everything
  } else if (req.user.role === "Editor") {
    next();
  } else {
    return res.status(403).json({ message: "Editor access required" });
  }
};

// Check if user has viewer or editor role
const requireViewer = (req, res, next) => {
  if (req.user.type === "admin") {
    next(); // Admin can access everything
  } else if (req.user.role === "Editor" || req.user.role === "Viewer") {
    next();
  } else {
    return res.status(403).json({ message: "Viewer access required" });
  }
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireEditor,
  requireViewer,
};
