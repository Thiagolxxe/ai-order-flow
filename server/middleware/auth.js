
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { rateLimit } = require('express-rate-limit');

// Criar limitador de taxa para autenticação
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
});

/**
 * Middleware para verificar token JWT
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
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
    
    // Verificar se o token está próximo da expiração
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.exp;
    
    // Se o token estiver a menos de 5 minutos da expiração, adicione flag para renovação
    if (exp && exp - now < 300) {
      req.tokenNeedsRefresh = true;
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    
    // Mensagem de erro específica para tokens expirados
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado', 
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

/**
 * Middleware para verificar CSRF token
 */
const validateCSRFToken = (req, res, next) => {
  // Verificar apenas em métodos não seguros (POST, PUT, DELETE, PATCH)
  const nonSafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (nonSafeMethods.includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'];
    const storedToken = req.session?.csrfToken;
    
    if (!csrfToken || !storedToken || csrfToken !== storedToken) {
      return res.status(403).json({ error: 'CSRF token inválido', code: 'INVALID_CSRF_TOKEN' });
    }
  }
  
  next();
};

/**
 * Middleware para verificar se o usuário tem papel específico
 * @param {String|Array} roles - Papel ou papéis para verificar
 * @returns {Function} Middleware Express
 */
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
      }
      
      const db = req.app.get('db');
      const userId = req.user.id;
      
      // Obter papéis do usuário
      const userRoles = await db.collection('user_roles')
        .find({ userId })
        .toArray();
      
      const userRolesList = userRoles.map(role => role.role);
      
      // Verificar se o usuário tem o papel requerido
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      const hasRequiredRole = userRolesList.some(role => requiredRoles.includes(role));
      
      if (!hasRequiredRole) {
        return res.status(403).json({ error: 'Sem permissão para acessar este recurso' });
      }
      
      // Adicionar papéis ao objeto de usuário para uso posterior
      req.user.roles = userRolesList;
      
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

/**
 * Gerar novo token JWT
 * @param {Object} payload - Dados para incluir no token
 * @param {string} expiresIn - Tempo de expiração (ex: '24h')
 * @returns {string} - Token JWT assinado
 */
const generateToken = (payload, expiresIn = '24h') => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

module.exports = {
  authenticateToken,
  validateCSRFToken,
  authRateLimiter,
  checkRole,
  hashPassword,
  comparePassword,
  generateToken
};
