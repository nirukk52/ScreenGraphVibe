import type { FastifyReply } from 'fastify';

export function createSseStream(res: FastifyReply) {
  res.raw.setHeader('Content-Type', 'text/event-stream');
  res.raw.setHeader('Cache-Control', 'no-cache');
  res.raw.setHeader('Connection', 'keep-alive');
  // @ts-ignore
  if (typeof res.raw.flushHeaders === 'function') res.raw.flushHeaders();
  return {
    send: (event: { type: string; id?: string; data: unknown }) => {
      if (event.type) res.raw.write(`event: ${event.type}\n`);
      if (event.id) res.raw.write(`id: ${event.id}\n`);
      res.raw.write(`data: ${JSON.stringify(event.data)}\n\n`);
    },
    end: () => res.raw.end(),
  };
}


