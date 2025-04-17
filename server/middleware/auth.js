
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { rateLimit } = require('express-rate-limit');
const crypto = require('crypto');

// Criar limitador de taxa para autenticação - mais restritivo
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
  skipSuccessfulRequests: true, // Não contar requisições bem-sucedidas
});

// Limitar taxa de tentativas de redefinição de senha
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 tentativas por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas solicitações de redefinição de senha. Tente novamente mais tarde.' }
});

/**
 * Middleware para verificar token JWT com validação aprimorada
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função next do Express
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Token de acesso não fornecido',
      code: 'MISSING_TOKEN'
    });
  }
  
  // Verificar formato do header Authorization
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ 
      error: 'Formato de token inválido',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }
  
  const [scheme, token] = parts;
  
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ 
      error: 'Formato de token inválido',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }
  
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is required');
    return res.status(500).json({ 
      error: 'Erro de configuração do servidor',
      code: 'SERVER_CONFIG_ERROR'
    });
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
    
    // Mensagens de erro específicas para diferentes tipos de falhas
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado', 
        code: 'TOKEN_EXPIRED'
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Token inválido', 
        code: 'INVALID_TOKEN'
      });
    } else if (err.name === 'NotBeforeError') {
      return res.status(403).json({ 
        error: 'Token ainda não válido', 
        code: 'TOKEN_NOT_ACTIVE'
      });
    }
    
    return res.status(403).json({ 
      error: 'Falha na autenticação', 
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Middleware para verificar CSRF token com validação reforçada
 */
const validateCSRFToken = (req, res, next) => {
  // Verificar apenas em métodos não seguros (POST, PUT, DELETE, PATCH)
  const nonSafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (nonSafeMethods.includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'];
    const storedToken = req.session?.csrfToken;
    
    if (!csrfToken || !storedToken) {
      return res.status(403).json({ 
        error: 'CSRF token ausente', 
        code: 'MISSING_CSRF_TOKEN' 
      });
    }
    
    // Comparação de tempo constante para evitar timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(csrfToken), Buffer.from(storedToken))) {
      return res.status(403).json({ 
        error: 'CSRF token inválido', 
        code: 'INVALID_CSRF_TOKEN' 
      });
    }
  }
  
  next();
};

/**
 * Middleware para verificar se o usuário tem papel específico
 * com validação aprimorada
 * @param {String|Array} roles - Papel ou papéis para verificar
 * @returns {Function} Middleware Express
 */
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: 'Não autenticado', 
          code: 'NOT_AUTHENTICATED'
        });
      }
      
      const db = req.app.get('db') || req.db;
      
      if (!db || typeof db.collection !== 'function') {
        console.error('Database connection not available in checkRole middleware');
        return res.status(503).json({ 
          error: 'Serviço temporariamente indisponível', 
          code: 'DB_UNAVAILABLE'
        });
      }
      
      const userId = req.user.id;
      
      // Obter papéis do usuário
      const userRoles = await db.collection('user_roles')
        .find({ userId })
        .toArray();
      
      if (!userRoles || userRoles.length === 0) {
        return res.status(403).json({ 
          error: 'Usuário sem papéis atribuídos', 
          code: 'NO_ROLES_ASSIGNED'
        });
      }
      
      const userRolesList = userRoles.map(role => role.role);
      
      // Verificar se o usuário tem o papel requerido
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      const hasRequiredRole = userRolesList.some(role => requiredRoles.includes(role));
      
      if (!hasRequiredRole) {
        return res.status(403).json({ 
          error: 'Sem permissão para acessar este recurso', 
          code: 'PERMISSION_DENIED'
        });
      }
      
      // Adicionar papéis ao objeto de usuário para uso posterior
      req.user.roles = userRolesList;
      
      next();
    } catch (error) {
      console.error('Error checking role:', error);
      res.status(500).json({ 
        error: 'Erro ao verificar permissões', 
        code: 'ROLE_CHECK_ERROR'
      });
    }
  };
};

/**
 * Helper function para hash de senha com fatores de custo mais seguros
 * @param {string} password - Senha em texto puro para hash
 * @returns {Promise<string>} - Senha com hash
 */
const hashPassword = async (password) => {
  // Usar um fator de custo mais alto (12-14) para maior segurança
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Helper function para comparar senha com hash
 * @param {string} password - Senha em texto puro para verificar
 * @param {string} hash - Senha com hash para comparar
 * @returns {Promise<boolean>} - True se a senha corresponder ao hash
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Gerar novo token JWT com opções mais seguras
 * @param {Object} payload - Dados para incluir no token
 * @param {string} expiresIn - Tempo de expiração (ex: '24h')
 * @returns {string} - Token JWT assinado
 */
const generateToken = (payload, expiresIn = '24h') => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  // Adicionar mais claims de segurança
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    }, 
    JWT_SECRET, 
    { 
      expiresIn,
      algorithm: 'HS256', // Algoritmo explícito
      audience: 'delivery-app-users', // Público alvo
      issuer: 'delivery-app-api', // Emissor
    }
  );
};

/**
 * Gerar token para resetar senha
 * @param {string} userId - ID do usuário
 * @returns {string} - Token de reset de senha
 */
const generatePasswordResetToken = (userId) => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  authenticateToken,
  validateCSRFToken,
  authRateLimiter,
  passwordResetLimiter,
  checkRole,
  hashPassword,
  comparePassword,
  generateToken,
  generatePasswordResetToken
};
