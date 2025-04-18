
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');

// Validation schemas
const schemas = {
  createVideo: Joi.object({
    titulo: Joi.string().min(3).required().messages({
      'string.min': 'O título deve ter pelo menos 3 caracteres',
      'any.required': 'Título é obrigatório'
    }),
    descricao: Joi.string().allow('').optional(),
    preco: Joi.number().min(0).required().messages({
      'number.min': 'O preço não pode ser negativo',
      'any.required': 'Preço é obrigatório'
    }),
    restaurante_id: Joi.string().required().messages({
      'any.required': 'ID do restaurante é obrigatório'
    }),
    video_url: Joi.string().uri().required().messages({
      'string.uri': 'URL do vídeo inválida',
      'any.required': 'URL do vídeo é obrigatória'
    }),
    thumbnail_url: Joi.string().uri().allow('').optional().messages({
      'string.uri': 'URL da thumbnail inválida'
    })
  }),
  updateVideo: Joi.object({
    titulo: Joi.string().min(3).messages({
      'string.min': 'O título deve ter pelo menos 3 caracteres'
    }),
    descricao: Joi.string().allow('').optional(),
    preco: Joi.number().min(0).messages({
      'number.min': 'O preço não pode ser negativo'
    }),
    video_url: Joi.string().uri().messages({
      'string.uri': 'URL do vídeo inválida'
    }),
    thumbnail_url: Joi.string().uri().allow('').optional().messages({
      'string.uri': 'URL da thumbnail inválida'
    }),
    status: Joi.string().valid('draft', 'active', 'inactive')
  }),
  watchProgress: Joi.object({
    progress: Joi.number().min(0).max(1).required().messages({
      'number.min': 'O progresso deve ser um valor entre 0 e 1',
      'number.max': 'O progresso deve ser um valor entre 0 e 1',
      'any.required': 'Progresso é obrigatório'
    }),
    timestamp: Joi.number().required().messages({
      'any.required': 'Timestamp é obrigatório'
    })
  })
};

// Middleware de validação
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

// Verificação do objeto db
const checkDatabase = (req, res, next) => {
  try {
    // Tentar obter a conexão do banco de dados de múltiplas fontes possíveis
    const db = req.app.get('db') || global.database || req.db;
    
    if (!db) {
      console.error('⚠️ Database connection not available in videoRoutes');
      return res.status(503).json({ 
        error: 'Serviço de banco de dados indisponível',
        message: 'A conexão com o banco de dados não está disponível no momento. Tente novamente mais tarde.',
        code: 'DB_CONNECTION_ERROR'
      });
    }
    
    // Verificar se o objeto db é válido
    if (typeof db.collection !== 'function') {
      console.error('⚠️ Invalid database object in videoRoutes');
      return res.status(503).json({
        error: 'Objeto de banco de dados inválido',
        message: 'O objeto de banco de dados está em um estado inválido. Contate o administrador.',
        code: 'INVALID_DB_OBJECT'
      });
    }
    
    // Atribuir db ao objeto req para uso posterior
    req.db = db;
    next();
  } catch (error) {
    console.error('⚠️ Error checking database in videoRoutes:', error);
    return res.status(503).json({ 
      error: 'Erro ao verificar conexão com banco de dados',
      message: error.message || 'Ocorreu um erro ao verificar a conexão com o banco de dados',
      code: 'DB_CHECK_ERROR'
    });
  }
};

// Aplica middleware de verificação de DB em todas as rotas do videoRoutes
router.use(checkDatabase);

// GET - Obter todos os vídeos (com paginação)
router.get('/', async (req, res) => {
  try {
    const db = req.db; // Use database from request
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const { page, limit, sort, order } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: {}
    };
    
    if (sort) {
      options.sort[sort] = order === 'desc' ? -1 : 1;
    } else {
      options.sort = { created_at: -1 };
    }
    
    const result = await videoRepo.findAll({ status: 'active' }, options);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar vídeos', 
      details: error.message,
      code: 'FETCH_VIDEOS_ERROR'
    });
  }
});

// Get trending videos
router.get('/trending', async (req, res) => {
  try {
    const db = req.db;
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const limit = parseInt(req.query.limit) || 10;
    const videos = await videoRepo.findTrending(limit);
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar vídeos em tendência',
      code: 'FETCH_TRENDING_ERROR'
    });
  }
});

// Get video by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.db;
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const video = await videoRepo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado', code: 'VIDEO_NOT_FOUND' });
    }
    
    // Increment view count
    await videoRepo.incrementViews(videoId);
    
    res.status(200).json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar vídeo',
      code: 'FETCH_VIDEO_ERROR'
    });
  }
});

// Create a new video
router.post('/', authenticateToken, validateBody(schemas.createVideo), async (req, res) => {
  try {
    const db = req.db;
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const userId = req.user.id;
    
    // Validate if user has permission to add videos for this restaurant
    const RestaurantRepository = require('../repositories/restaurantRepository');
    const restaurantRepo = new RestaurantRepository(db);
    
    const restaurant = await restaurantRepo.findById(req.body.restaurante_id);
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado', code: 'RESTAURANT_NOT_FOUND' });
    }
    
    if (restaurant.proprietario_id !== userId) {
      return res.status(403).json({ 
        error: 'Sem permissão para adicionar vídeos a este restaurante',
        code: 'PERMISSION_DENIED'
      });
    }
    
    const videoData = {
      ...req.body,
      usuario_id: userId,
      restaurante_nome: restaurant.nome,
      views: 0,
      likes: 0,
      status: 'active',
      liked_by: []
    };
    
    const result = await videoRepo.create(videoData);
    
    res.status(201).json({ 
      success: true, 
      videoId: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao criar vídeo',
      code: 'CREATE_VIDEO_ERROR'
    });
  }
});

// Update a video
router.put('/:id', authenticateToken, validateBody(schemas.updateVideo), async (req, res) => {
  try {
    const db = req.db;
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const userId = req.user.id;
    
    // Check if video exists and user has permission
    const video = await videoRepo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado', code: 'VIDEO_NOT_FOUND' });
    }
    
    if (video.usuario_id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para editar este vídeo', code: 'PERMISSION_DENIED' });
    }
    
    const result = await videoRepo.update(videoId, req.body);
    
    res.status(200).json({ 
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao atualizar vídeo',
      code: 'UPDATE_VIDEO_ERROR'
    });
  }
});

// Delete a video
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = req.db;
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const userId = req.user.id;
    
    // Check if video exists and user has permission
    const video = await videoRepo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado', code: 'VIDEO_NOT_FOUND' });
    }
    
    if (video.usuario_id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para excluir este vídeo', code: 'PERMISSION_DENIED' });
    }
    
    // Soft delete - update status to inactive
    const result = await videoRepo.update(videoId, { status: 'inactive' });
    
    res.status(200).json({ 
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao excluir vídeo',
      code: 'DELETE_VIDEO_ERROR'
    });
  }
});

// Like/unlike a video
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const db = req.db;
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const userId = req.user.id;
    const { action } = req.body; // 'like' or 'unlike'
    
    if (action !== 'like' && action !== 'unlike') {
      return res.status(400).json({ 
        error: 'Ação inválida. Use "like" ou "unlike"',
        code: 'INVALID_ACTION'
      });
    }
    
    // Check if video exists
    const video = await videoRepo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado', code: 'VIDEO_NOT_FOUND' });
    }
    
    const isLiking = action === 'like';
    const result = await videoRepo.toggleLike(videoId, userId, isLiking);
    
    res.status(200).json({ 
      success: true,
      liked: isLiking,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error liking/unliking video:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao curtir/descurtir vídeo',
      code: 'LIKE_ERROR'
    });
  }
});

// Report watch progress (for heatmap generation)
router.post('/:id/watch-progress', validateBody(schemas.watchProgress), async (req, res) => {
  try {
    const db = req.db;
    if (!db) {
      return res.status(503).json({ 
        error: 'Serviço de banco de dados indisponível', 
        code: 'DB_CONNECTION_ERROR' 
      });
    }
    
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const { progress, timestamp } = req.body;
    
    // Registrar progresso de visualização
    await db.collection('video_watch_progress').insertOne({
      video_id: videoId,
      progress,
      timestamp,
      created_at: new Date()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error reporting watch progress:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao reportar progresso de visualização',
      code: 'REPORT_PROGRESS_ERROR'
    });
  }
});

module.exports = router;
