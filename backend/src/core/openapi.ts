/**
 * @module core/openapi
 * @description Generates OpenAPI JSON by spinning an in-memory Fastify app and dumping the spec.
 */
import { createApp } from './app.js';

async function main() {
  const app = await createApp();
  // Fastify Swagger exposes the spec at this utility method
  // @ts-ignore - fastify-swagger augments instance
  const spec = await app.swagger();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(spec, null, 2));
  await app.close();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


