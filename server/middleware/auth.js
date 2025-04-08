
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token de acesso não fornecido' });
  
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is required');
    return res.status(500).json({ error: 'Erro de configuração do servidor' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

/**
 * Middleware to check if user has specific role
 * @param {String|Array} roles - Role or roles to check against
 * @returns {Function} Express middleware
 */
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
      }
      
      const db = req.app.get('db');
      const userId = req.user.id;
      
      // Get user roles
      const userRoles = await db.collection('user_roles')
        .find({ userId })
        .toArray();
      
      const userRolesList = userRoles.map(role => role.role);
      
      // Check if user has required role
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      const hasRequiredRole = userRolesList.some(role => requiredRoles.includes(role));
      
      if (!hasRequiredRole) {
        return res.status(403).json({ error: 'Sem permissão para acessar este recurso' });
      }
      
      next();
    } catch (error) {
      console.error('Error checking role:', error);
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};

module.exports = {
  authenticateToken,
  checkRole
};
