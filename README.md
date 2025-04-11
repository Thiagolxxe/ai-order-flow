
# DeliveryAI - Aplicativo de Delivery de Comida

## Sobre o Projeto

DeliveryAI é uma aplicação de delivery de comida que oferece funcionalidades como:
- Exploração de restaurantes
- Pedidos online
- Acompanhamento de entregas
- Integração com MongoDB Atlas

## Estrutura do Projeto

O projeto é dividido em duas partes principais:
- **Frontend**: Aplicação React com TypeScript usando Vite
- **Backend**: API RESTful em Express.js conectada ao MongoDB Atlas

## Requisitos

- Node.js (versão 14 ou superior)
- Conta no MongoDB Atlas
- NPM ou Yarn

## Como Iniciar o Projeto Localmente

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do diretório `server/`
   - Adicione as seguintes variáveis:
     ```
     MONGODB_URI=sua_string_de_conexao_mongodb
     JWT_SECRET=seu_jwt_secret
     ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
     PORT=5000
     ```

4. Inicie o servidor:
   ```
   node start-server.js
   ```

5. Inicie o frontend:
   ```
   npm run dev
   ```

## Deploy em Plataformas Gratuitas

### Opção 1: Render

1. Crie uma conta no [Render](https://render.com/)
2. Crie um novo Web Service
3. Conecte ao repositório Git
4. Configure:
   - **Nome**: deliveryai-backend
   - **Ambiente**: Node
   - **Comando de build**: npm install
   - **Comando de start**: node server/server.js
   - **Variáveis de ambiente**: Adicione as mesmas do arquivo .env

### Opção 2: Railway

1. Crie uma conta no [Railway](https://railway.app/)
2. Crie um novo projeto
3. Conecte ao repositório Git
4. Configure variáveis de ambiente
5. Configure o comando de start: `node server/server.js`

### Opção 3: Vercel

1. Crie uma conta no [Vercel](https://vercel.com/)
2. Crie um novo projeto
3. Conecte ao repositório Git
4. Configure:
   - **Output Directory**: ./dist
   - **Install Command**: npm install
   - **Build Command**: npm run build
   - **Development Command**: npm run dev
   - **Variáveis de ambiente**: Adicione as mesmas do arquivo .env
5. Na aba "Function Settings", configure:
   - **Root Directory**: ./server
   - **Handler**: server.js

## Observações para Deploy

1. Certifique-se que as variáveis de ambiente estejam configuradas na plataforma escolhida
2. Configure a origem CORS (ALLOWED_ORIGINS) para incluir o domínio do frontend
3. Para o frontend, atualize os endpoints de API para apontar para o URL do seu backend implantado
4. Certifique-se que sua conta MongoDB Atlas permite conexões da plataforma que você escolheu (na aba Network Access)

## Contribuindo

Sinta-se à vontade para contribuir com o projeto. Abra issues ou envie pull requests para melhorias e correções.
