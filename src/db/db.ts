import { drizzle } from 'drizzle-orm/node-postgres';

import { env } from '../data/env';
import { relations } from './relations';

export const db = drizzle({
  relations,
  connection: {
    password: env.DB_PASSWORD,
    user: env.DB_USER,
    database: env.DB_NAME,
    host: env.DB_HOST,
    port: env.DB_PORT
  }
});
