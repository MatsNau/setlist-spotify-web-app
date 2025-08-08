import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config, validateConfig } from './src/config/environment.js';
import { requestLogger } from './src/middleware/logging.js';
import apiRoutes from './src/routes/index.js';
import keepAliveService from './src/services/keepAliveService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
  origin: config.nodeEnv === 'production' 
    ? config.client.url 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(requestLogger);

// API Routes
app.use('/api', apiRoutes);

// ============================================
// STATIC FILES - MUSS NACH ALLEN API ROUTES KOMMEN!
// ============================================
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Catch all route - serve React app - MUSS DIE ALLERLETZTE ROUTE SEIN!
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Server starten
app.listen(config.port, config.host, () => {
  console.log(`Server running on http://${config.host}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  
  validateConfig();
  
  // Start KeepAlive service to prevent Render from sleeping
  keepAliveService.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  keepAliveService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  keepAliveService.stop();
  process.exit(0);
});