require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || process.env.IISNODE_HTTP_PORT || 3000;
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

// Logging inicial para debug
console.log('=== INICIANDO SERVIDOR PRAXIS ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('IISNODE_HTTP_PORT:', process.env.IISNODE_HTTP_PORT);
console.log('DATABASE_URL configurada:', !!process.env.DATABASE_URL);
console.log('Directorio actual:', __dirname);
console.log('Proceso ejecutándose en iisnode:', !!process.env.IISNODE_HTTP_PORT);

const resolvePrismaRoot = () => {
  const explicitSchemaDir = process.env.PRISMA_SCHEMA_PATH
    ? path.dirname(process.env.PRISMA_SCHEMA_PATH)
    : null;
  const candidates = Array.from(new Set([
    path.join(__dirname, 'prisma'),
    path.join(__dirname, '../prisma'),
    path.join(__dirname, '../../prisma'),
    path.join(process.cwd(), 'prisma'),
    explicitSchemaDir,
  ].filter(Boolean)));

  for (const candidate of candidates) {
    try {
      const schemaPath = path.join(candidate, 'schema.prisma');
      if (fs.existsSync(schemaPath)) {
        console.log('Prisma schema located at:', schemaPath);
        return candidate;
      }
    } catch (error) {
      console.warn('Failed inspecting Prisma candidate:', candidate, error.message);
    }
  }

  console.warn('Prisma schema not found. Checked:', candidates);
  return null;
};

const prismaRoot = resolvePrismaRoot();
if (prismaRoot) {
  process.env.PRISMA_SCHEMA_PATH = path.join(prismaRoot, 'schema.prisma');
}

const resolveFrontendRoot = () => {
  const candidates = [
    path.join(__dirname, 'public'),
    path.join(__dirname, '../public'),
    path.join(__dirname, '../../public'),
    path.join(__dirname, '../frontend/dist'),
    path.join(__dirname, '../../frontend/dist'),
  ];

  for (const candidate of candidates) {
    const indexFile = path.join(candidate, 'index.html');
    if (fs.existsSync(indexFile)) {
      console.log('Frontend build found at:', candidate);
      return candidate;
    }
  }

  console.warn('No compiled frontend found near:', __dirname);
  return null;
};

const frontendRoot = resolveFrontendRoot();

// Inicialización de Prisma en Azure
if (process.env.NODE_ENV === 'production' && process.env.IISNODE_HTTP_PORT) {
  console.log('Inicializando Prisma en Azure...');

  try {
    process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
    process.env.PRISMA_CLI_QUERY_ENGINE_TYPE = 'binary';
    process.env.PRISMA_GENERATE_SKIP_AUTOINSTALL = 'true';

    if (!prismaRoot) {
      console.log('Prisma directory not found; skipping Prisma initialization.');
    } else {
      console.log('Using Prisma directory at:', prismaRoot);
const backendRoot = path.resolve(__dirname, '..');
const clientPath = path.join(backendRoot, 'node_modules', '.prisma', 'client');
const indexJsPath = path.join(clientPath, 'index.js');

      if (fs.existsSync(clientPath) && fs.existsSync(indexJsPath)) {
        console.log('Prisma client already exists, skipping generation');
      } else {
        console.log('Generating Prisma client...');
const backendRoot = path.resolve(__dirname, '..');
const prismaBinary = path.join(backendRoot, 'node_modules', '.bin', 'prisma');
const workingDir = backendRoot;

        const prismaCmd = fs.existsSync(prismaBinary)
   ? `"${prismaBinary}"`
  : 'node ./node_modules/prisma/build/index.js';

        const prismaEnv = {
          ...process.env,
          PRISMA_CLIENT_ENGINE_TYPE: 'binary',
          PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary',
          PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true',
          PRISMA_SCHEMA_PATH: process.env.PRISMA_SCHEMA_PATH,
        };

        execSync(`${prismaCmd} generate`, {
          stdio: 'inherit',
          cwd: workingDir,
          env: prismaEnv,
        });

        console.log('Prisma client generated successfully');
      }
    }
  } catch (error) {
    console.error('Failed to initialize Prisma:', error.message);
    console.log('Continuing with server startup despite Prisma error...');
  }
}

const app = express();

// Logging de peticiones
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    prisma: Boolean(prismaRoot),
    frontend: Boolean(frontendRoot)
  });
});

// Ruta temporal de prueba
app.get('/auth/check', (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: 1,
      name: 'Admin Local',
      role: 'admin'
    }
  });
});

// API routes
app.use('/', routes);

// Servir frontend compilado
if (frontendRoot) {
  app.use(express.static(frontendRoot));
}

// SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
    if (frontendRoot) {
      const indexPath = path.join(frontendRoot, 'index.html');

      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Praxis Backend</title>
      </head>
      <body>
        <h1>Praxis Backend API</h1>
        <p>Servidor funcionando correctamente</p>
        <p>Backend ejecutándose en el puerto ${PORT}</p>
      </body>
      </html>
    `);
  }

  return res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler al final
app.use(errorHandler);

// Listen al final
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;