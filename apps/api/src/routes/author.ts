import z from "zod";
import { Hono } from "hono";
import { anyApi } from "convex/server";
import { sValidator } from "@hono/standard-validator";

import { convex } from "../lib/convex";
import { serializeDates } from "../lib/dates";
import { apiKeyAuth, type ApiKeyEnv } from "../middleware/auth";

const app = new Hono();

const createAuthorSchema = z.object({
  name: z.string().min(1),
  birthday: z.coerce.date().optional(),
});

const updateAuthorSchema = z.object({
  name: z.string().min(1).optional(),
  birthday: z.coerce.date().nullable().optional(),
});

app.get("/", async (c) => {
  const authors = await convex.query(anyApi.authors.list, {});
  return c.json(authors.map((a: Record<string, unknown>) => serializeDates(a, ["birthday", "createdAt"])));
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const author = await convex.query(anyApi.authors.getById, { id });

  if (author == null) {
    return c.json({ error: "Author not found" }, 404);
  }

  return c.json(serializeDates(author, ["birthday", "createdAt"]));
});

const protectedApp = new Hono<ApiKeyEnv>();
protectedApp.use(apiKeyAuth);

protectedApp.post("/", sValidator("json", createAuthorSchema), async (c) => {
  const data = c.req.valid("json");
  const author = await convex.mutation(anyApi.authors.create, {
    name: data.name,
    birthday: data.birthday?.getTime(),
  });

  return c.json(serializeDates(author, ["birthday", "createdAt"]), 201);
});

protectedApp.put("/:id", sValidator("json", updateAuthorSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const author = await convex.mutation(anyApi.authors.update, {
    id,
    name: data.name,
    birthday: data.birthday === null ? null : data.birthday?.getTime(),
  });

  if (author == null) {
    return c.json({ error: "Author not found" }, 404);
  }

  return c.json(serializeDates(author, ["birthday", "createdAt"]));
});

protectedApp.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await convex.mutation(anyApi.authors.remove, { id });

  return c.body(null, 204);
});

app.route("/", protectedApp);

export default app;
