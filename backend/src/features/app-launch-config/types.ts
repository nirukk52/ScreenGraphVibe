import { 
  AppLaunchConfig, 
  NewAppLaunchConfig, 
  AppLaunchConfigRequest, 
  AppLaunchConfigResponse,
  AppLaunchConfigListResponse 
} from '@screengraph/data';

// Re-export data types for agent use
export type {
  AppLaunchConfig,
  NewAppLaunchConfig,
  AppLaunchConfigRequest,
  AppLaunchConfigResponse,
  AppLaunchConfigListResponse,
};

// Agent-specific types
export interface AppLaunchConfigService {
  getAllConfigs(): Promise<AppLaunchConfigResponse[]>;
  getConfigById(id: string): Promise<AppLaunchConfigResponse | null>;
  createConfig(config: AppLaunchConfigRequest): Promise<AppLaunchConfigResponse>;
  updateConfig(id: string, config: Partial<AppLaunchConfigRequest>): Promise<AppLaunchConfigResponse>;
  deleteConfig(id: string): Promise<boolean>;
  getDefaultConfig(): Promise<AppLaunchConfigResponse | null>;
  setDefaultConfig(id: string): Promise<AppLaunchConfigResponse>;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationErrors {
  errors: ValidationError[];
}
