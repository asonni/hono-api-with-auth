import z from 'zod';
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { anyApi } from 'convex/server';
import { sValidator } from '@hono/standard-validator';

import { convex } from '../lib/convex';
import { serializeDates } from '../lib/dates';
import { env } from '../data/env';

type JwtEnv = {
  Variables: {
    jwtPayload: { sub: string; email: string; exp: number };
  };
};

const app = new Hono<JwtEnv>();

const createKeySchema = z.object({
  name: z.string().min(1).max(255),
  expiresAt: z.string().optional(),
});

let _jwtMiddleware: ReturnType<typeof jwt> | null = null;
app.use(async (c, next) => {
  if (_jwtMiddleware === null) {
    _jwtMiddleware = jwt({ secret: env.JWT_SECRET, alg: 'HS256' });
  }
  return _jwtMiddleware(c, next);
});

app.get('/', async (c) => {
  const { sub: userId } = c.var.jwtPayload;

  const keys = await convex.query(anyApi.apiKeys.listByUser, { userId });

  return c.json(
    keys.map((k: Record<string, unknown>) =>
      serializeDates(k, ['createdAt', 'expiresAt'])
    )
  );
});

app.post('/', sValidator('json', createKeySchema), async (c) => {
  const { sub: userId } = c.var.jwtPayload;
  const { name, expiresAt } = c.req.valid('json');
  const { raw, hash, prefix } = await convex.action(
    anyApi.crypto.generateApiKey,
    {}
  );

  let expiresAtValue: number | null | undefined = undefined;

  if (typeof expiresAt === 'string') {
    const date = new Date(expiresAt);
    expiresAtValue = isNaN(date.getTime()) ? null : date.getTime();
  }

  const apiKey = await convex.mutation(anyApi.apiKeys.create, {
    userId,
    name,
    keyHash: hash,
    keyPrefix: prefix,
    expiresAt: expiresAtValue,
  });

  return c.json({ key: raw, id: apiKey.id }, 201);
});

app.delete('/:id', async (c) => {
  const { sub: userId } = c.var.jwtPayload;
  const id = c.req.param('id');

  await convex.mutation(anyApi.apiKeys.remove, { id, userId });

  return c.body(null, 204);
});

export default app;
