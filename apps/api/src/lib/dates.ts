export function toDate(ms: number | null | undefined): string | null {
  if (ms == null) return null;
  return new Date(ms).toISOString();
}

export function serializeDates<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'number') {
      result[field] = toDate(value) as T[keyof T];
    }
  }
  return result;
}
