import { ConvexHttpClient } from "convex/browser";

import { env } from "../data/env.ts";

export const convex = new ConvexHttpClient(env.CONVEX_URL);
