import { Hono } from 'hono';

import swaggerJson from '../swagger.json' with { type: 'json' };

import authorRoutes from './routes/author';
import authRoutes from './routes/auth';
import apiKeyRoutes from './routes/apiKey';
import bookRoutes from './routes/book';
import swaggerRoute from './routes/swagger';

const app = new Hono();

app.route('/authors', authorRoutes);
app.route('/books', bookRoutes);
app.route('/auth', authRoutes);
app.route('/api-keys', apiKeyRoutes);
app.route('/docs', swaggerRoute);

// Serve swagger.json for Swagger UI
app.get('/swagger.json', (c) => c.json(swaggerJson));

export default app;
