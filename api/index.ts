import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();

// Apply middleware and register routes
app.use(express.json());

// Register all API routes
registerRoutes(app);

export default app;