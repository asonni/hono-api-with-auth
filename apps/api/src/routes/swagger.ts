import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = JSON.parse(
  readFileSync(join(__dirname, '../../swagger.json'), 'utf-8')
);

const swagger = new Hono();

swagger.get(
  '/',
  swaggerUI({
    url: '/swagger.json',
    title: 'API Docs',
    spec: swaggerDocument,
  })
);

export default swagger;
