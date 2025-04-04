
const express = require('express');
const cors = require('cors');
const mongoose = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createCollectionsAndIndexes } = require('./db/init');
require('dotenv').config();

// Inicializar Express
const app = express();
app.use(express.json());
app.use(cors());

// String de conexão MongoDB
const uri = process.env.MONGODB_URI || "mongodb+srv://Deliverai:b0C2Qg6LblURU1LK@cluster0.cbela9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token de acesso não fornecido' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret_key_development_only', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
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
app.post('/api/auth/register', async (req, res) => {
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
      process.env.JWT_SECRET || 'secret_key_development_only',
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

app.post('/api/auth/login', async (req, res) => {
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
      process.env.JWT_SECRET || 'secret_key_development_only',
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
app.post('/api/restaurants', authenticateToken, async (req, res) => {
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
