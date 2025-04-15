
const express = require('express');
const router = express.Router();
const videoRoutes = require('./videoRoutes');

// Middleware para verificar conexão com banco de dados
router.use((req, res, next) => {
  const db = req.app.get('db');
  if (!db) {
    console.error('Database connection not available in routes');
    return res.status(503).json({ 
      error: 'Serviço de banco de dados indisponível',
      message: 'A conexão com o banco de dados não está disponível. Verifique a conexão com MongoDB.'
    });
  }
  next();
});

// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor', 
    message: err.message 
  });
};

// Middleware para rotas não encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
};

// Register all route handlers
router.use('/videos', videoRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  const db = req.app.get('db');
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dbConnected: !!db
  });
});

// Manipulação de erros
router.use(errorHandler);

// Manipulação de rotas não encontradas (deve ser a última)
router.use(notFoundHandler);

module.exports = router;
