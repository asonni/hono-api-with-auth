import z from 'zod';
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { and, eq } from 'drizzle-orm';
import { sValidator } from '@hono/standard-validator';

import { db } from '../db/db';
import { env } from '../data/env';
import { ApiKeyTable } from '../db/schema';
import { generateApiKey } from '../lib/crypto';

type JwtEnv = {
  Variables: {
    jwtPayload: { sub: string; email: string; exp: number };
  };
};

const app = new Hono<JwtEnv>();

const createKeySchema = z.object({
  name: z.string().min(1).max(255),
  expiresAt: z.string().optional()
});

app.use(jwt({ secret: env.JWT_SECRET, alg: 'HS256' }));

app.get('/', async c => {
  const { sub: userId } = c.var.jwtPayload;

  const keys = await db.query.ApiKeyTable.findMany({
    where: { userId },
    columns: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      expiresAt: true
    }
  });

  return c.json(keys);
});

app.post('/', sValidator('json', createKeySchema), async c => {
  const { sub: userId } = c.var.jwtPayload;
  const { name, expiresAt } = c.req.valid('json');
  const { hash, prefix, raw } = generateApiKey();

  let expiresAtValue: Date | null | undefined = null;

  if (typeof expiresAt === 'string') {
    const date = new Date(expiresAt);
    expiresAtValue = isNaN(date.getTime()) ? null : date;
  }

  const [apiKey] = await db
    .insert(ApiKeyTable)
    .values({
      name,
      userId,
      expiresAt: expiresAtValue,
      keyHash: hash,
      keyPrefix: prefix
    })
    .returning({ id: ApiKeyTable.id });

  return c.json({ key: raw, id: apiKey.id, expiresAt: expiresAtValue }, 201);
});

app.delete('/:id', async c => {
  const { sub: userId } = c.var.jwtPayload;
  const id = c.req.param('id');

  await db
    .delete(ApiKeyTable)
    .where(and(eq(ApiKeyTable.id, id), eq(ApiKeyTable.userId, userId)));

  return c.body(null, 204);
});

export default app;
