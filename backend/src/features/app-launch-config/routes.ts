import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { appLaunchConfigService } from './services.js';
import type { 
  AppLaunchConfigRequest, 
  ApiResponse,
  ValidationErrors 
} from './types.js';

// Validation schemas
const AppLaunchConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apkPath: z.string().min(1, 'APK path is required'),
  packageName: z.string().min(1, 'Package name is required'),
  appActivity: z.string().min(1, 'App activity is required'),
  appiumServerUrl: z.string().url('Invalid Appium server URL'),
  isDefault: z.boolean().optional(),
});

const UpdateAppLaunchConfigSchema = AppLaunchConfigSchema.partial();

// Helper function to create API response
function createResponse<T>(
  success: boolean, 
  data?: T, 
  error?: string, 
  message?: string
): ApiResponse<T> {
  return { success, data, error, message };
}

// Helper function to handle validation errors
function handleValidationError(error: z.ZodError): ValidationErrors {
  return {
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

export async function appLaunchConfigRoutes(fastify: FastifyInstance) {
  // GET /app-launch-configs - Get all configurations
  fastify.get('/app-launch-configs', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const configs = await appLaunchConfigService.getAllConfigs();
      return reply.code(200).send(createResponse(true, configs));
    } catch (error) {
      fastify.log.error(error as Error, 'Error fetching app launch configs');
      return reply.code(500).send(createResponse(false, undefined, 'Internal server error'));
    }
  });

  // GET /app-launch-configs/:id - Get configuration by ID
  fastify.get<{ Params: { id: string } }>('/app-launch-configs/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const config = await appLaunchConfigService.getConfigById(id);
      
      if (!config) {
        return reply.code(404).send(createResponse(false, undefined, 'App launch configuration not found'));
      }
      
      return reply.code(200).send(createResponse(true, config));
    } catch (error) {
      fastify.log.error(error as Error, 'Error fetching app launch config');
      return reply.code(500).send(createResponse(false, undefined, 'Internal server error'));
    }
  });

  // GET /app-launch-configs/default - Get default configuration
  fastify.get('/app-launch-configs/default', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = await appLaunchConfigService.getDefaultConfig();
      
      if (!config) {
        return reply.code(404).send(createResponse(false, undefined, 'No default configuration found'));
      }
      
      return reply.code(200).send(createResponse(true, config));
    } catch (error) {
      fastify.log.error(error as Error, 'Error fetching default app launch config');
      return reply.code(500).send(createResponse(false, undefined, 'Internal server error'));
    }
  });

  // POST /app-launch-configs - Create new configuration
  fastify.post<{ Body: AppLaunchConfigRequest }>('/app-launch-configs', async (request, reply) => {
    try {
      // Validate request body
      const validationResult = AppLaunchConfigSchema.safeParse(request.body);
      if (!validationResult.success) {
        const validationErrors = handleValidationError(validationResult.error);
        return reply.code(400).send(createResponse(false, undefined, 'Validation failed', JSON.stringify(validationErrors)));
      }

      const config = await appLaunchConfigService.createConfig(validationResult.data);
      return reply.code(201).send(createResponse(true, config, undefined, 'App launch configuration created successfully'));
    } catch (error) {
      fastify.log.error(error as Error, 'Error creating app launch config');
      return reply.code(500).send(createResponse(false, undefined, 'Internal server error'));
    }
  });

  // PUT /app-launch-configs/:id - Update configuration
  fastify.put<{ Params: { id: string }; Body: Partial<AppLaunchConfigRequest> }>('/app-launch-configs/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Validate request body
      const validationResult = UpdateAppLaunchConfigSchema.safeParse(request.body);
      if (!validationResult.success) {
        const validationErrors = handleValidationError(validationResult.error);
        return reply.code(400).send(createResponse(false, undefined, 'Validation failed', JSON.stringify(validationErrors)));
      }

      const config = await appLaunchConfigService.updateConfig(id, validationResult.data);
      return reply.code(200).send(createResponse(true, config, undefined, 'App launch configuration updated successfully'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send(createResponse(false, undefined, error.message));
      }
      fastify.log.error(error as Error, 'Error updating app launch config');
      return reply.code(500).send(createResponse(false, undefined, 'Internal server error'));
    }
  });

  // DELETE /app-launch-configs/:id - Delete configuration
  fastify.delete<{ Params: { id: string } }>('/app-launch-configs/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const deleted = await appLaunchConfigService.deleteConfig(id);
      
      if (!deleted) {
        return reply.code(404).send(createResponse(false, undefined, 'App launch configuration not found'));
      }
      
      return reply.code(200).send(createResponse(true, undefined, undefined, 'App launch configuration deleted successfully'));
    } catch (error) {
      fastify.log.error(error as Error, 'Error deleting app launch config');
      return reply.code(500).send(createResponse(false, undefined, 'Internal server error'));
    }
  });

  // POST /app-launch-configs/:id/set-default - Set configuration as default
  fastify.post<{ Params: { id: string } }>('/app-launch-configs/:id/set-default', async (request, reply) => {
    try {
      const { id } = request.params;
      const config = await appLaunchConfigService.setDefaultConfig(id);
      return reply.code(200).send(createResponse(true, config, undefined, 'Default configuration updated successfully'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send(createResponse(false, undefined, error.message));
      }
      fastify.log.error(error as Error, 'Error setting default app launch config');
      return reply.code(500).send(createResponse(false, undefined, 'Internal server error'));
    }
  });
}
