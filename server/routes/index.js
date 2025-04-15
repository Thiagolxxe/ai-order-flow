
const express = require('express');
const router = express.Router();
const videoRoutes = require('./videoRoutes');

// Middleware para verificar conexão com banco de dados
router.use((req, res, next) => {
  try {
    // Tentar obter a conexão do banco de dados de múltiplas fontes possíveis
    const db = req.app.get('db') || global.database || req.db;
    
    if (!db) {
      console.error('⚠️ Database connection not available in routes');
      return res.status(503).json({ 
        error: 'Serviço de banco de dados indisponível',
        message: 'A conexão com o banco de dados não está disponível. Verifique a conexão com MongoDB.',
        code: 'DB_CONNECTION_ERROR'
      });
    }
    
    // Verificar se a conexão está ativa
    if (typeof db.collection !== 'function') {
      console.error('⚠️ Invalid database object detected');
      return res.status(503).json({
        error: 'Objeto de banco de dados inválido',
        message: 'A conexão com o banco de dados está em um estado inválido. Reinicie o servidor.',
        code: 'INVALID_DB_OBJECT'
      });
    }
    
    // Atribuir db ao objeto req para uso pelas rotas
    req.db = db;
    next();
  } catch (error) {
    console.error('⚠️ Error checking database in routes:', error);
    return res.status(503).json({
      error: 'Erro ao verificar conexão com banco de dados',
      message: error.message || 'Ocorreu um erro ao verificar a conexão com o banco de dados',
      code: 'DB_CHECK_ERROR'
    });
  }
});

// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor', 
    message: err.message,
    code: 'INTERNAL_SERVER_ERROR'
  });
};

// Middleware para rotas não encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    code: 'ROUTE_NOT_FOUND'
  });
};

// Register all route handlers
router.use('/videos', videoRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  try {
    const db = req.db;
    
    // Verificar a conexão com o banco de dados executando uma operação simples
    if (db && typeof db.collection === 'function') {
      // Verificar status de componentes
      const components = [
        { name: 'api', status: 'ok' },
        { name: 'database', status: 'ok' }
      ];
      
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        components,
        dbConnected: true
      });
    } else {
      const components = [
        { name: 'api', status: 'ok' },
        { name: 'database', status: 'error' }
      ];
      
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Database connection unavailable',
        components,
        dbConnected: false
      });
    }
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      components: [
        { name: 'api', status: 'error' },
        { name: 'database', status: 'error' }
      ],
      dbConnected: false
    });
  }
});

// Manipulação de erros
router.use(errorHandler);

// Manipulação de rotas não encontradas (deve ser a última)
router.use(notFoundHandler);

module.exports = router;
