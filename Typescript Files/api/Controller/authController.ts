import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import { adminQueries, userAuthQueries } from "../MODELS/queries";
import {
  AuthenticatedRequest,
  JWTPayload,
  TempTokenPayload,
} from "../../types";

// Generate JWT Token
const generateToken = (payload: Omit<JWTPayload, "iat" | "exp">): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

// Generate Temporary Token
const generateTempToken = (
  payload: Omit<TempTokenPayload, "iat" | "exp">
): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
};

// Verify Temporary Token
const verifyTempToken = (token: string): TempTokenPayload | null => {
  try {
    const decoded = jwtDecode<TempTokenPayload>(token);

    if (decoded.type !== "temp" || !decoded.tempAccess) {
      return null;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Admin Login
export const adminLogin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const admin = await adminQueries.findAdminByEmail(email);
    if (!admin) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      workspaceId: "",
      workspace: {
        _id: "",
        name: "",
        __v: 0,
      },
      role: "admin",
      type: "admin",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: "admin",
        type: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Workspace User Login
// checking if user is assosciated with more than one workspace
export const userLogin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await userAuthQueries.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Check if user has workspaces
    if (user.workspaces.length === 0) {
      res
        .status(403)
        .json({ message: "No workspace assigned. Contact admin." });
      return;
    }

    // If user has only one workspace, automatically selecting it
    if (user.workspaces.length === 1) {
      const selectedWorkspace = user.workspaces[0].workspaceId;
      const userRole = user.workspaces[0].role;
      const workspaceName = user.workspaces[0].workspaceName;

      //Generating token with the workspace id

      const accessTokenPayload: Omit<JWTPayload, "iat" | "exp"> = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        workspaceId: selectedWorkspace.toString(),
        workspace: {
          _id: selectedWorkspace.toString(),
          name: workspaceName,
          __v: 0,
        },
        role: userRole,
        type: "user",
      };
      const accessToken = generateToken(accessTokenPayload);

      return res.json({
        message: "Login successful",
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          workspaces: user.workspaces.map((w) => ({
            id: w.workspaceId,
            name: w.workspaceName,
            role: w.role,
          })),
        },
      });
    }

    // Generating temp token for workspace selection
    const tempTokenPayload: Omit<TempTokenPayload, "iat" | "exp"> = {
      id: user._id.toString(),
      email: user.email,
      type: "temp",
      tempAccess: true,
    };

    const tempToken = generateTempToken(tempTokenPayload);

    res.json({
      message:
        "Multiple workspaces found. Please select a workspace within 5 minutes",
      tempToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        workspaces: user.workspaces.map((w) => ({
          id: w.workspaceId,
          name: w.workspaceName,
          role: w.role,
        })),
      },
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//WorkSpace Selection
export const selectWorkspace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { workspaceId } = req.body;
    const tempToken = req.headers.authorization?.split(" ")[1];

    if (!tempToken) {
      res.status(401).json({ message: "Temporary token required" });
      return;
    }

    if (!workspaceId) {
      res.status(400).json({ message: "Workspace ID is required" });
      return;
    }

    //verify temp token
    const decoded = verifyTempToken(tempToken);

    if (!decoded) {
      res.status(401).json({ message: "Invalid or expired temporary token" });
      return;
    }

    // Get user details
    const user = await userAuthQueries.findUserByEmail(decoded.email);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const selectedWorkspace = user.workspaces.find(
      (w) => w.workspaceId.toString() === workspaceId
    );

    if (!selectedWorkspace) {
      res.status(403).json({ message: "Access denied to this workspace" });
      return;
    }

    // Generate token for the selected workspace
    const accessTokenPayload: Omit<JWTPayload, "iat" | "exp"> = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      workspaceId: selectedWorkspace.workspaceId.toString(),
      workspace: {
        _id: selectedWorkspace.workspaceId.toString(),
        name: selectedWorkspace.workspaceName,
        __v: 0,
      },
      role: selectedWorkspace.role,
      type: "user",
    };

    const accessToken = generateToken(accessTokenPayload);

    res.json({
      message: "Workspace selected successfully",
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        workspaceId: selectedWorkspace.workspaceId,
        workspace: {
          id: selectedWorkspace.workspaceId,
          name: selectedWorkspace.workspaceName,
        },
        role: selectedWorkspace.role,
      },
    });
  } catch (error) {
    console.error("Workspace selection error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
