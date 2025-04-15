
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createCollectionsAndIndexes } = require('./db/init');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Inicializar Express
const app = express();

// Aplicar Helmet para configurar cabeçalhos HTTP seguros
app.use(helmet());

app.use(express.json({ limit: '1mb' }));

// Configuração de CORS mais permissiva para ambiente de desenvolvimento
const corsOptions = {
  origin: '*', // Permite qualquer origem (para desenvolvimento)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 horas em segundos
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Habilitar CORS para todas as rotas
app.use(cors(corsOptions));

// Middleware específico para OPTIONS (preflight)
app.options('*', cors(corsOptions));

// Rota de diagnóstico CORS
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS está configurado corretamente',
    origin: req.headers.origin || 'Desconhecido',
    requestHeaders: req.headers
  });
});

// String de conexão MongoDB
const uri = process.env.MONGODB_URI || "mongodb+srv://Deliverai:Deliverai@cluster0.cbela9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
console.log(`Tentando conectar ao MongoDB com URI: ${uri.substring(0, 20)}...`);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "deliverai-secret-jwt-development-key";
if (!process.env.JWT_SECRET) {
  console.warn('AVISO: JWT_SECRET não definido no ambiente. Usando chave padrão para desenvolvimento.');
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

// Connection setup with global database management
let mongoClient = null;
let database = null;

async function connectToMongoDB() {
  try {
    if (mongoClient) {
      console.log('MongoDB connection already exists, reusing...');
      return { client: mongoClient, db: database };
    }

    console.log(`Connecting to MongoDB with URI: ${uri.substring(0, 20)}...`);

    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    console.log("MongoDB Atlas connection established successfully");

    const db = client.db("delivery_app");
    
    // Global database and client storage
    mongoClient = client;
    database = db;
    global.mongoClient = client;
    global.database = db;

    // Create collections and indexes
    await createCollectionsAndIndexes(db);
    
    // Set up connection monitoring
    client.on('connectionPoolCreated', (event) => {
      console.log('Connection pool created');
    });
    
    client.on('connectionPoolClosed', (event) => {
      console.log('Connection pool closed');
    });
    
    client.on('connectionPoolCleared', (event) => {
      console.log('Connection pool cleared');
    });
    
    client.on('connectionClosed', (event) => {
      console.log('Connection closed');
    });
    
    client.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// Connection state handler
let isConnecting = false;
let connectionPromise = null;

function getOrCreateConnection() {
  if (database && mongoClient) {
    return Promise.resolve({ client: mongoClient, db: database });
  }
  
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }
  
  isConnecting = true;
  connectionPromise = connectToMongoDB()
    .finally(() => {
      isConnecting = false;
    });
    
  return connectionPromise;
}

// Middleware to ensure database is available
app.use(async (req, res, next) => {
  try {
    if (!database) {
      console.log("Database not connected, attempting connection...");
      const { db } = await getOrCreateConnection();
      req.db = db;
    } else {
      req.db = database;
    }
    next();
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return res.status(503).json({ 
      error: 'Database connection unavailable', 
      message: 'Could not connect to MongoDB. Please try again later.' 
    });
  }
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

// Import API routes
const apiRoutes = require('./routes/index');

// Apply API routes
app.use('/api', apiRoutes);

// Rotas de autenticação
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const db = req.db;
    if (!db) {
      return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
    }
    
    const { email, password, nome, sobrenome } = req.body;
    
    // Validar os campos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
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

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const db = req.db;
    if (!db) {
      return res.status(503).json({ error: 'Serviço de banco de dados indisponível' });
    }
    
    const { email, password } = req.body;
    
    // Validar os campos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
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

// Rota de teste para verificar o estado do banco de dados
app.get('/api/db-status', async (req, res) => {
  try {
    const db = req.db;
    if (!db) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Database not connected' 
      });
    }
    
    // Testar se o banco de dados está realmente operacional
    await db.command({ ping: 1 });
    
    res.json({ 
      status: 'ok', 
      message: 'Database connected and operational',
      collections: await db.listCollections().toArray()
    });
  } catch (error) {
    console.error('Database status check error:', error);
    res.status(503).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Iniciar servidor e conectar ao MongoDB
async function startServer() {
  try {
    await getOrCreateConnection();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
    
    // Configurar graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down server...');
      if (mongoClient) {
        console.log('Closing MongoDB connection...');
        await mongoClient.close();
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer().catch((error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});
