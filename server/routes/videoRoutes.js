const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Validation schemas
const Joi = require('joi');
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
  const db = req.app.get('db');
  if (!db) {
    console.error('Database connection not available in videoRoutes');
    return res.status(503).json({ 
      error: 'Serviço de banco de dados indisponível',
      message: 'A conexão com o banco de dados não está disponível no momento. Tente novamente mais tarde.'
    });
  }
  next();
};

// Aplica middleware de verificação de DB em todas as rotas do videoRoutes
router.use(checkDatabase);

// Get all videos with pagination
router.get('/', async (req, res) => {
  try {
    const db = req.app.get('db');
    // A verificação de db já é feita pelo middleware checkDatabase
    
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
    res.status(500).json({ error: 'Erro ao buscar vídeos', details: error.message });
  }
});

// Get trending videos
router.get('/trending', async (req, res) => {
  try {
    const db = req.app.get('db');
    if (!db) {
      return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
    }
    
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const limit = parseInt(req.query.limit) || 10;
    const videos = await videoRepo.findTrending(limit);
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    res.status(500).json({ error: 'Erro ao buscar vídeos em tendência' });
  }
});

// Get video by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.get('db');
    if (!db) {
      return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
    }
    
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const video = await videoRepo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }
    
    // Increment view count
    await videoRepo.incrementViews(videoId);
    
    res.status(200).json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Erro ao buscar vídeo' });
  }
});

// Create a new video
router.post('/', authenticateToken, validateBody(schemas.createVideo), async (req, res) => {
  try {
    const db = req.app.get('db');
    if (!db) {
      return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
    }
    
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const userId = req.user.id;
    
    // Validate if user has permission to add videos for this restaurant
    const RestaurantRepository = require('../repositories/restaurantRepository');
    const restaurantRepo = new RestaurantRepository(db);
    
    const restaurant = await restaurantRepo.findById(req.body.restaurante_id);
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    
    if (restaurant.proprietario_id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para adicionar vídeos a este restaurante' });
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
      error: error.message || 'Erro ao criar vídeo' 
    });
  }
});

// Update a video
router.put('/:id', authenticateToken, validateBody(schemas.updateVideo), async (req, res) => {
  try {
    const db = req.app.get('db');
    if (!db) {
      return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
    }
    
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const userId = req.user.id;
    
    // Check if video exists and user has permission
    const video = await videoRepo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }
    
    if (video.usuario_id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para editar este vídeo' });
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
      error: error.message || 'Erro ao atualizar vídeo' 
    });
  }
});

// Delete a video
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = req.app.get('db');
    if (!db) {
      return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
    }
    
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const userId = req.user.id;
    
    // Check if video exists and user has permission
    const video = await videoRepo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }
    
    if (video.usuario_id !== userId) {
      return res.status(403).json({ error: 'Sem permissão para excluir este vídeo' });
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
      error: error.message || 'Erro ao excluir vídeo' 
    });
  }
});

// Like/unlike a video
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const db = req.app.get('db');
    if (!db) {
      return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
    }
    
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const userId = req.user.id;
    const { action } = req.body; // 'like' or 'unlike'
    
    if (action !== 'like' && action !== 'unlike') {
      return res.status(400).json({ error: 'Ação inválida. Use "like" ou "unlike"' });
    }
    
    // Check if video exists
    const video = await videoRepo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
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
      error: error.message || 'Erro ao curtir/descurtir vídeo' 
    });
  }
});

// Report watch progress (for heatmap generation)
router.post('/:id/watch-progress', validateBody(schemas.watchProgress), async (req, res) => {
  try {
    const db = req.app.get('db');
    if (!db) {
      return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
    }
    
    const VideoRepository = require('../repositories/videoRepository');
    const videoRepo = new VideoRepository(db);
    
    const videoId = req.params.id;
    const { progress, timestamp } = req.body;
    
    // Verificar se o vídeo existe
    const video = await videoRepo.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }
    
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
      error: error.message || 'Erro ao reportar progresso de visualização' 
    });
  }
});

module.exports = router;
