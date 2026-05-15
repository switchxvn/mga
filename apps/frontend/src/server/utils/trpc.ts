import type { H3Event } from 'h3';

export async function fetchTrpcQuery<T>(event: H3Event, procedure: string, input?: unknown): Promise<T> {
  const response = await event.$fetch<unknown>(`/api/trpc/${procedure}`, {
    query: {
      batch: '1',
      input: JSON.stringify({ 0: input ?? null }),
    },
  });

  const result = Array.isArray(response) ? response[0] : response;
  const data = (result as any)?.result?.data;

  if (data?.json !== undefined) {
    return data.json as T;
  }

  return data as T;
}
