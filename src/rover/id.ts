let counter = 0;

/** Short, collision-resistant id for client-generated entities. */
export function uid(prefix = "id"): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}

export const nowISO = () => new Date().toISOString();
