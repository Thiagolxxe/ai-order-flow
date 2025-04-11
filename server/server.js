
const express = require('express');
const cors = require('cors');
const mongoose = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createCollectionsAndIndexes } = require('./db/init');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const helmet = require('helmet');
require('dotenv').config();

// Inicializar Express
const app = express();

// Aplicar Helmet para configurar cabeçalhos HTTP seguros
app.use(helmet());

app.use(express.json({ limit: '1mb' }));

// Configuração de CORS mais permissiva para ambiente de produção
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 horas em segundos
};
app.use(cors(corsOptions));

// String de conexão MongoDB
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is required');
  process.exit(1);
}

// Configurar rate limiting para todas as requisições
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições, tente novamente mais tarde' }
});

// Aplicar rate limiting global
app.use(globalLimiter);

// Configurar rate limiting específico para autenticação (mais restritivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // limite de 5 tentativas por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login, tente novamente mais tarde' }
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token de acesso não fornecido' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Validação com Joi
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),
  registration: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
    nome: Joi.string().min(2).messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres'
    }),
    sobrenome: Joi.string().min(2).messages({
      'string.min': 'Sobrenome deve ter pelo menos 2 caracteres'
    })
  }),
  restaurant: Joi.object({
    nome: Joi.string().min(3).required().messages({
      'string.min': 'O nome do restaurante deve ter pelo menos 3 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    tipo_cozinha: Joi.string().min(2).required().messages({
      'string.min': 'O tipo de cozinha deve ter pelo menos 2 caracteres',
      'any.required': 'Tipo de cozinha é obrigatório'
    }),
    descricao: Joi.string().allow('').optional(),
    telefone: Joi.string().min(10).required().messages({
      'string.min': 'Telefone deve ter pelo menos 10 dígitos',
      'any.required': 'Telefone é obrigatório'
    }),
    endereco: Joi.string().min(5).required().messages({
      'string.min': 'Endereço deve ter pelo menos 5 caracteres',
      'any.required': 'Endereço é obrigatório'
    }),
    cidade: Joi.string().min(2).required().messages({
      'string.min': 'Cidade deve ter pelo menos 2 caracteres',
      'any.required': 'Cidade é obrigatória'
    }),
    estado: Joi.string().length(2).required().messages({
      'string.length': 'Estado deve ser a sigla com 2 caracteres',
      'any.required': 'Estado é obrigatório'
    }),
    cep: Joi.string().min(8).required().messages({
      'string.min': 'CEP deve ter pelo menos 8 dígitos',
      'any.required': 'CEP é obrigatório'
    }),
    faixa_preco: Joi.number().min(1).max(5).required().messages({
      'number.min': 'Faixa de preço deve ser entre 1 e 5',
      'number.max': 'Faixa de preço deve ser entre 1 e 5',
      'any.required': 'Faixa de preço é obrigatória'
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

// Criar cliente MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Conectar ao MongoDB e inicializar o banco de dados
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Conectado com sucesso ao MongoDB Atlas!");
    
    const db = client.db("delivery_app");
    
    // Inicializar o banco de dados com collections e indexes
    await createCollectionsAndIndexes(db);
    
    return db;
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  }
}

// Rotas de autenticação
app.post('/api/auth/register', authLimiter, validateBody(schemas.registration), async (req, res) => {
  try {
    const db = client.db("delivery_app");
    const { email, password, nome, sobrenome } = req.body;
    
    // Verificar se o usuário já existe
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já registrado' });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Criar usuário
    const userId = new ObjectId();
    const user = {
      _id: userId,
      email,
      password: hashedPassword,
      user_metadata: {
        nome: nome || '',
        sobrenome: sobrenome || '',
      },
      created_at: new Date()
    };
    
    await db.collection('users').insertOne(user);
    
    // Criar perfil
    await db.collection('profiles').insertOne({
      userId: userId.toString(),
      name: nome || '',
      lastName: sobrenome || '',
      created_at: new Date()
    });
    
    // Atribuir papel de cliente
    await db.collection('user_roles').insertOne({
      userId: userId.toString(),
      role: 'cliente',
      created_at: new Date()
    });
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: userId.toString(), email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      user: {
        id: userId.toString(),
        email,
        user_metadata: {
          nome: nome || '',
          sobrenome: sobrenome || '',
        }
      },
      session: {
        access_token: token
      }
    });
    
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

app.post('/api/auth/login', authLimiter, validateBody(schemas.login), async (req, res) => {
  try {
    const db = client.db("delivery_app");
    const { email, password } = req.body;
    
    // Buscar usuário
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }
    
    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        user_metadata: user.user_metadata
      },
      session: {
        access_token: token
      }
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Rotas para restaurantes
app.post('/api/restaurants', authenticateToken, validateBody(schemas.restaurant), async (req, res) => {
  try {
    const db = client.db("delivery_app");
    const userId = req.user.id;
    const restaurantData = req.body;
    
    // Criar restaurante
    const restaurant = {
      nome: restaurantData.nome,
      tipo_cozinha: restaurantData.tipo_cozinha,
      descricao: restaurantData.descricao || null,
      telefone: restaurantData.telefone,
      endereco: restaurantData.endereco,
      cidade: restaurantData.cidade,
      estado: restaurantData.estado,
      cep: restaurantData.cep,
      faixa_preco: restaurantData.faixa_preco,
      proprietario_id: userId,
      created_at: new Date()
    };
    
    const result = await db.collection('restaurants').insertOne(restaurant);
    
    // Adicionar papel de proprietário de restaurante
    await db.collection('user_roles').insertOne({
      userId: userId,
      role: 'restaurante',
      created_at: new Date()
    });
    
    res.status(201).json({ 
      success: true, 
      restaurantId: result.insertedId.toString(), 
      userId 
    });
    
  } catch (error) {
    console.error('Erro ao criar restaurante:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao criar restaurante' 
    });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const db = client.db("delivery_app");
    const restaurantId = req.params.id;
    
    // Verificar se o ID é válido
    if (!ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: 'ID de restaurante inválido' });
    }
    
    // Buscar restaurante
    const restaurant = await db.collection('restaurants').findOne({
      _id: new ObjectId(restaurantId)
    });
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante não encontrado' });
    }
    
    // Buscar avaliações
    const ratings = await db.collection('ratings')
      .find({ restaurantId: restaurantId })
      .toArray();
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
      : 0;
    
    res.status(200).json({
      id: restaurant._id.toString(),
      name: restaurant.nome,
      address: `${restaurant.endereco}, ${restaurant.cidade} - ${restaurant.estado}`,
      cuisine: restaurant.tipo_cozinha,
      rating: avgRating,
      imageUrl: restaurant.banner_url || restaurant.logo_url,
      deliveryPosition: {
        lat: -23.5643,
        lng: -46.6527
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    res.status(500).json({ error: 'Erro ao buscar restaurante' });
  }
});

// Rotas para entregadores
app.post('/api/delivery/register', authenticateToken, async (req, res) => {
  try {
    const db = client.db("delivery_app");
    const userId = req.user.id;
    const deliveryData = req.body;
    
    // Criar perfil de entregador
    const deliveryPerson = {
      ...deliveryData,
      user_id: userId,
      status: 'pending',
      created_at: new Date()
    };
    
    const result = await db.collection('delivery_people').insertOne(deliveryPerson);
    
    // Adicionar papel de entregador
    await db.collection('user_roles').insertOne({
      userId: userId,
      role: 'entregador',
      created_at: new Date()
    });
    
    res.status(201).json({ 
      success: true, 
      deliveryId: result.insertedId.toString(), 
      userId 
    });
    
  } catch (error) {
    console.error('Erro ao registrar entregador:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao registrar entregador' 
    });
  }
});

// Rotas para notificações
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const db = client.db("delivery_app");
    const userId = req.user.id;
    
    // Buscar notificações
    const notifications = await db.collection('notifications')
      .find({ usuario_id: userId })
      .sort({ criado_em: -1 })
      .toArray();
    
    res.status(200).json(notifications);
    
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

app.patch('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const db = client.db("delivery_app");
    const notificationId = req.params.id;
    
    // Verificar se o ID é válido
    if (!ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: 'ID de notificação inválido' });
    }
    
    // Atualizar notificação
    await db.collection('notifications').updateOne(
      { _id: new ObjectId(notificationId), usuario_id: req.user.id },
      { $set: { lida: true } }
    );
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para verificar a conexão com o MongoDB
app.get('/api/check-connection', async (req, res) => {
  try {
    await client.db("admin").command({ ping: 1 });
    const status = {
      success: true,
      message: 'Conectado ao MongoDB',
      timestamp: new Date(),
      server: 'MongoDB Atlas',
      database: 'delivery_app'
    };
    console.log('Ping ao MongoDB bem-sucedido:', status);
    res.status(200).json(status);
  } catch (error) {
    console.error('Erro na conexão com o MongoDB:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha na conexão com o MongoDB',
      details: error.message,
      timestamp: new Date()
    });
  }
});

// Rota raiz para verificar se o servidor está rodando (útil para plataformas de hospedagem)
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Servidor DeliveryAI funcionando!',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
let db;

const startServer = async () => {
  db = await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`MongoDB conectado na base de dados: delivery_app`);
    console.log(`Verifique a conexão em: http://localhost:${PORT}/api/check-connection`);
  });
};

startServer().catch(console.error);

// Gerenciar encerramento do servidor
process.on('SIGINT', async () => {
  await client.close();
  console.log('Conexão com MongoDB fechada');
  process.exit(0);
});

