
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
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

/**
 * Helper function to hash a password
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Helper function to compare a password with a hash
 * @param {string} password - Plain text password to check
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} - True if password matches hash
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  authenticateToken,
  checkRole,
  hashPassword,
  comparePassword
};
