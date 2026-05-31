import z from 'zod';
import { Hono } from 'hono';
import { anyApi } from 'convex/server';
import { sValidator } from '@hono/standard-validator';

import { convex } from '../lib/convex';
import { serializeDates } from '../lib/dates';
import { apiKeyAuth, type ApiKeyEnv } from '../middleware/auth';

const app = new Hono();

const createBookSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  publishDate: z.coerce.date().optional(),
  pageCount: z.number().int().positive().optional(),
  authorId: z.string(),
});

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  publishDate: z.coerce.date().nullable().optional(),
  pageCount: z.number().int().positive().nullable().optional(),
  authorId: z.string().optional(),
});

app.get('/', async (c) => {
  const books = await convex.query(anyApi.books.list, {});
  return c.json(
    books.map((b: Record<string, any>) => ({
      ...serializeDates(b, ['publishDate', 'createdAt']),
      author: b.author
        ? serializeDates(b.author, ['birthday', 'createdAt'])
        : b.author,
    }))
  );
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const book = await convex.query(anyApi.books.getById, { id });

  if (book == null) {
    return c.json({ error: 'Book not found' }, 404);
  }

  return c.json({
    ...serializeDates(book, ['publishDate', 'createdAt']),
    author: book.author
      ? serializeDates(book.author, ['birthday', 'createdAt'])
      : book.author,
  });
});

const protectedApp = new Hono<ApiKeyEnv>();
protectedApp.use(apiKeyAuth);

protectedApp.post('/', sValidator('json', createBookSchema), async (c) => {
  const { id: userId } = c.get('apiKeyUser');
  const data = c.req.valid('json');

  const author = await convex.query(anyApi.authors.getById, {
    id: data.authorId,
  });
  if (author == null) {
    return c.json({ error: 'Author not found' }, 400);
  }

  const book = await convex.mutation(anyApi.books.create, {
    title: data.title,
    description: data.description,
    publishDate: data.publishDate?.getTime(),
    pageCount: data.pageCount,
    authorId: data.authorId,
    addedBy: userId,
  });

  return c.json(serializeDates(book, ['publishDate', 'createdAt']), 201);
});

protectedApp.put('/:id', sValidator('json', updateBookSchema), async (c) => {
  const id = c.req.param('id');
  const { id: userId, role } = c.get('apiKeyUser');
  const data = c.req.valid('json');

  if (data.authorId != null) {
    const author = await convex.query(anyApi.authors.getById, {
      id: data.authorId,
    });
    if (author == null) {
      return c.json({ error: 'Author not found' }, 400);
    }
  }

  const book = await convex.mutation(anyApi.books.update, {
    id,
    title: data.title,
    description: data.description === null ? null : data.description,
    publishDate: data.publishDate === null ? null : data.publishDate?.getTime(),
    pageCount: data.pageCount === null ? null : data.pageCount,
    authorId: data.authorId,
    userId,
    role,
  });

  if (book == null) {
    return c.json('Book not found', 404);
  }

  return c.json(serializeDates(book, ['publishDate', 'createdAt']));
});

protectedApp.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const { id: userId, role } = c.get('apiKeyUser');

  await convex.mutation(anyApi.books.remove, { id, userId, role });

  return c.body(null, 204);
});

app.route('/', protectedApp);

export default app;
