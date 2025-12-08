import jwttoken from '#utils/jwt.js';
import logger from '#config/logger.js';

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Access token is required' 
      });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded;
    
    logger.info(`User authenticated: ${decoded.email}`);
    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Invalid or expired token' 
    });
  }
};

export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!rolesArray.includes(userRole)) {
      logger.warn(`Access denied for user ${req.user.email} with role ${userRole}. Required roles: ${rolesArray.join(', ')}`);
      
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};