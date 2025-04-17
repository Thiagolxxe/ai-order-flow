
const express = require('express');
const router = express.Router();
const videoRoutes = require('./videoRoutes');

// Middleware para verificar conexão com banco de dados com maior robustez
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
    
    // Verificar se a conexão está ativa e é do tipo esperado
    if (typeof db.collection !== 'function') {
      console.error('⚠️ Invalid database object detected');
      return res.status(503).json({
        error: 'Objeto de banco de dados inválido',
        message: 'A conexão com o banco de dados está em um estado inválido. Reinicie o servidor.',
        code: 'INVALID_DB_OBJECT'
      });
    }
    
    // Verificar estado da conexão com ping rápido
    db.command({ ping: 1 })
      .then(() => {
        // Conexão confirmada, podemos prosseguir
        // Atribuir db ao objeto req para uso pelas rotas
        req.db = db;
        next();
      })
      .catch(err => {
        console.error('⚠️ Database ping failed:', err);
        return res.status(503).json({
          error: 'Falha na conexão com o banco de dados',
          message: 'O servidor não conseguiu se comunicar com o MongoDB. Tente novamente mais tarde.',
          code: 'DB_PING_FAILED'
        });
      });
  } catch (error) {
    console.error('⚠️ Error checking database in routes:', error);
    return res.status(503).json({
      error: 'Erro ao verificar conexão com banco de dados',
      message: error.message || 'Ocorreu um erro ao verificar a conexão com o banco de dados',
      code: 'DB_CHECK_ERROR'
    });
  }
});

// Middleware para tratamento de erros melhorado
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.stack);
  
  // Identificar o tipo de erro para fornecer mensagens mais úteis
  let statusCode = 500;
  let errorMessage = 'Erro interno do servidor';
  let errorCode = 'INTERNAL_SERVER_ERROR';
  
  // Verificar tipos de erro comuns e ajustar resposta
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Erro de validação: ' + err.message;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      statusCode = 409;
      errorMessage = 'Erro de duplicação: Este registro já existe';
      errorCode = 'DUPLICATE_KEY';
    } else {
      errorCode = 'DATABASE_ERROR';
      errorMessage = 'Erro de banco de dados: ' + err.message;
    }
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    errorMessage = 'Erro de sintaxe na requisição';
    errorCode = 'SYNTAX_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Formato de ID inválido';
    errorCode = 'INVALID_ID';
  }
  
  res.status(statusCode).json({ 
    error: errorMessage, 
    message: err.message,
    code: errorCode
  });
};

// Middleware para rotas não encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    code: 'ROUTE_NOT_FOUND'
  });
};

// Register all route handlers
router.use('/videos', videoRoutes);

// Health check endpoint aprimorado
router.get('/health', async (req, res) => {
  try {
    const db = req.db;
    const startTime = Date.now();
    let dbPingResult = null;
    let dbPingTime = null;
    
    // Componentes a serem verificados
    const components = [
      { name: 'api', status: 'ok', responseTime: null }
    ];
    
    // Verificar a conexão com o banco de dados executando uma operação simples
    if (db && typeof db.collection === 'function') {
      try {
        // Medir tempo de resposta do banco de dados
        const pingStart = Date.now();
        dbPingResult = await db.command({ ping: 1 });
        dbPingTime = Date.now() - pingStart;
        
        components.push({ 
          name: 'database', 
          status: 'ok',
          responseTime: dbPingTime,
          vendor: 'MongoDB'
        });
      } catch (dbError) {
        console.error('Database ping failed:', dbError);
        
        components.push({ 
          name: 'database', 
          status: 'error',
          error: dbError.message,
          vendor: 'MongoDB'
        });
        
        return res.status(503).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          error: 'Database connection failed: ' + dbError.message,
          components,
          dbConnected: false,
          responseTime: Date.now() - startTime
        });
      }
    } else {
      components.push({ 
        name: 'database', 
        status: 'error',
        error: 'Database connection unavailable',
        vendor: 'MongoDB'
      });
      
      return res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Database connection unavailable',
        components,
        dbConnected: false,
        responseTime: Date.now() - startTime
      });
    }
    
    // Calcular tempo de resposta total
    const totalResponseTime = Date.now() - startTime;
    components[0].responseTime = totalResponseTime;
    
    // Verificar limites de tempo de resposta
    if (dbPingTime && dbPingTime > 1000) {
      components.find(c => c.name === 'database').warning = 'High latency detected';
    }
    
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      components,
      dbConnected: true,
      responseTime: totalResponseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      components: [
        { name: 'api', status: 'error', error: error.message },
        { name: 'database', status: 'unknown' }
      ],
      dbConnected: false,
      responseTime: Date.now() - startTime
    });
  }
});

// Manipulação de erros
router.use(errorHandler);

// Manipulação de rotas não encontradas (deve ser a última)
router.use(notFoundHandler);

module.exports = router;
