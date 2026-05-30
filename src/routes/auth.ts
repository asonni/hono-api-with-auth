import z from 'zod';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { sValidator } from '@hono/standard-validator';

import { db } from '../db/db';
import { env } from '../data/env';
import { UserTable } from '../db/schema';
import { hashPassword, verifyPassword } from '../lib/crypto';

// Set JWT expiration to one day (24 hours)
const JWT_EXPIRATION_SECONDS = 24 * 60 * 60; // one day in seconds

const app = new Hono();

const registerSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(1)
});

app.post('/register', sValidator('json', registerSchema), async c => {
  const { email, password } = c.req.valid('json');
  const existing = await db.query.UserTable.findFirst({ where: { email } });
  if (existing != null) {
    return c.json({ error: 'Email already in use' }, 409);
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(UserTable)
    .values({ email, passwordHash })
    .returning({ id: UserTable.id, email: UserTable.email });

  return c.json(user, 201);
});

app.post('/login', sValidator('json', loginSchema), async c => {
  const { email, password } = c.req.valid('json');
  const user = await db.query.UserTable.findFirst({ where: { email } });
  if (user == null) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const now = Math.floor(Date.now() / 1000);

  const token = await sign(
    { exp: now + JWT_EXPIRATION_SECONDS, sub: user.id, email: user.email },
    env.JWT_SECRET,
    'HS256'
  );

  return c.json({ token });
});

export default app;
