/**
 * @module features/app-launch-config/controller
 * @description HTTP controller for app-launch-config feature. Intentionally commented-out scaffold
 *              to avoid changing current runtime. When ready to migrate, uncomment and wire in routes.
 *
 * Responsibilities
 * - Accept already-validated input (see validators)
 * - Call service methods only (no business logic here)
 * - Shape response according to validators
 */

// import type { FastifyReply, FastifyRequest } from 'fastify';
// import type { AppLaunchConfigService } from './types.js';
// import { createResponse } from './app-launch-config.validators.js';

// export function makeAppLaunchConfigController(service: AppLaunchConfigService) {
//   return {
//     getAll: async (_req: FastifyRequest, reply: FastifyReply) => {
//       const configs = await service.getAllConfigs();
//       reply.status(200).send(createResponse(true, configs));
//     },
//     getById: async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
//       const config = await service.getConfigById(req.params.id);
//       if (!config) return reply.status(404).send(createResponse(false, undefined, 'Not found'));
//       reply.status(200).send(createResponse(true, config));
//     },
//     getDefault: async (_req: FastifyRequest, reply: FastifyReply) => {
//       const config = await service.getDefaultConfig();
//       if (!config) return reply.status(404).send(createResponse(false, undefined, 'No default configuration found'));
//       reply.status(200).send(createResponse(true, config));
//     },
//     create: async (req: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
//       // Body is validated at route layer; types here should already be narrowed
//       const config = await service.createConfig(req.body as any);
//       reply.status(201).send(createResponse(true, config, undefined, 'Created'));
//     },
//     update: async (req: FastifyRequest<{ Params: { id: string }; Body: unknown }>, reply: FastifyReply) => {
//       const config = await service.updateConfig(req.params.id, req.body as any);
//       reply.status(200).send(createResponse(true, config, undefined, 'Updated'));
//     },
//     remove: async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
//       const deleted = await service.deleteConfig(req.params.id);
//       if (!deleted) return reply.status(404).send(createResponse(false, undefined, 'Not found'));
//       reply.status(200).send(createResponse(true, undefined, undefined, 'Deleted'));
//     },
//     setDefault: async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
//       const config = await service.setDefaultConfig(req.params.id);
//       reply.status(200).send(createResponse(true, config, undefined, 'Default updated'));
//     },
//   };
// }


