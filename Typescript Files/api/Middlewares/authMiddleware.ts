import { Request, Response, NextFunction } from 'express';
import { jwtDecode } from 'jwt-decode';
import { adminQueries, userAuthQueries } from '../MODELS/queries';
import { AuthenticatedRequest, JWTPayload } from '../../types/types';

// Verify Token Middleware
export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Headers: ', req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token found in authorization header');
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    console.log('Token received:', token);

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      res.status(500).json({ message: 'Server error' });
      return;
    }

    console.log('JWT_SECRET is present');
    const decoded = jwtDecode<JWTPayload>(token);
    console.log('Token decoded successfully:', { id: decoded.id, email: decoded.email, type: decoded.type });
    
    if (!decoded.id || !decoded.email || !decoded.type) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    let currentUser;
    if (decoded.type === 'admin') {
      currentUser = await adminQueries.findAdminByEmail(decoded.email);
    } else if (decoded.type === 'user') {
      currentUser = await userAuthQueries.findUserByEmail(decoded.email);
      
      if (decoded.workspaceId && currentUser) {
        const hasWorkspaceAccess = currentUser.workspaces.some(
          w => w.workspaceId.toString() === decoded.workspaceId
        );
        
        if (!hasWorkspaceAccess) {
          res.status(403).json({ message: 'Workspace access revoked' });
          return;
        }
      }
    } else {
      res.status(401).json({ message: 'Invalid user type in token' });
      return;
    }

    if (!currentUser) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Attaching user info to the request
    req.user = decoded;
    req.currentUser = currentUser;
    next();

  } catch (error: any) {
    console.log('Token verification error:', error.message);
    console.log('Error name:', error.name);
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired' });
      return;
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token verification failed' });
  }
};

// Check if user is admin
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user?.type !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};

// Check if user has editor role
export const requireEditor = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user?.type === 'admin') {
    next(); 
  } else if (req.user?.role === 'Editor') {
    next();
  } else {
    res.status(403).json({ message: 'Editor access required' });
  }
};

// Check if user has viewer or editor role
export const requireViewer = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user?.type === 'admin') {
    next();
  } else if (req.user?.role === 'Editor' || req.user?.role === 'Viewer') {
    next();
  } else {
    res.status(403).json({ message: 'Viewer access required' });
  }
};
