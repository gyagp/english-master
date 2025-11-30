import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import progressRoutes from './routes/progress';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', contentRoutes);
app.use('/api', progressRoutes);

// Serve static files from the React client
const clientBuildPath = path.join(process.cwd(), '../client/dist');
console.log('Serving client from:', clientBuildPath);

if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // Handle React routing, return all requests to React app
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  console.error(`Client build not found at ${clientBuildPath}. Please run 'npm run build' in the client directory.`);
}

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
