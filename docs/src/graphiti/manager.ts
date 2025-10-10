/**
 * @module GraphitiManager
 * @description Manages Graphiti MCP connectivity with retry and manual recovery hooks.
 * @dependencies Node.js fs/path (no direct MCP calls here; caller injects a check function)
 * @publicAPI GraphitiManager, createDefaultGraphitiManager
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface RetryConfig {
  maxAttempts: number;
  intervalSeconds: number;
  groupId: string;
  coolDownMsAfterMax: number;
  pingFileDir?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  currentAttempt: number;
  maxAttempts: number;
  lastError?: string;
}

export type ConnectivityCheck = () => Promise<boolean>;

export class GraphitiManager {
  private readonly config: RetryConfig;
  private readonly checkConnectivity: ConnectivityCheck;
  private isConnected: boolean = false;
  private currentAttempt: number = 0;
  private lastError?: string;
  private retryTimer: NodeJS.Timeout | null = null;

  constructor(config: RetryConfig, checkConnectivity: ConnectivityCheck) {
    this.config = config;
    this.checkConnectivity = checkConnectivity;
  }

  async start(): Promise<void> {
    await this.runCheck();
  }

  stop(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  getStatus(): ConnectionStatus {
    return {
      isConnected: this.isConnected,
      currentAttempt: this.currentAttempt,
      maxAttempts: this.config.maxAttempts,
      lastError: this.lastError,
    };
  }

  async resetAfterManualFix(): Promise<void> {
    this.currentAttempt = 0;
    await this.runCheck();
  }

  private scheduleRetry(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.retryTimer = setTimeout(() => {
      void this.runCheck();
    }, this.config.intervalSeconds * 1000);
  }

  private async runCheck(): Promise<void> {
    try {
      const ok = await this.checkConnectivity();
      if (ok) {
        this.isConnected = true;
        this.currentAttempt = 0;
        this.lastError = undefined;
        return;
      }
      throw new Error('Connectivity check returned false');
    } catch (err) {
      this.isConnected = false;
      this.currentAttempt += 1;
      this.lastError = err instanceof Error ? err.message : 'Unknown error';

      if (this.currentAttempt < this.config.maxAttempts) {
        this.scheduleRetry();
        return;
      }

      await this.attemptRecoveryAction();

      // Cool down before next cycle
      setTimeout(() => {
        this.currentAttempt = 0;
        void this.runCheck();
      }, this.config.coolDownMsAfterMax);
    }
  }

  private async attemptRecoveryAction(): Promise<void> {
    try {
      const dir = this.config.pingFileDir ?? path.join(process.cwd(), 'docs', '.graphiti');
      await fs.mkdir(dir, { recursive: true });
      const filePath = path.join(dir, 'ping.json');
      const payload = { pingAt: new Date().toISOString(), groupId: this.config.groupId };
      await fs.writeFile(filePath, JSON.stringify(payload));
    } catch {
      // Intentionally swallow; recovery is best-effort.
    }
  }
}

export function createDefaultGraphitiManager(check: ConnectivityCheck): GraphitiManager {
  return new GraphitiManager(
    {
      maxAttempts: 4,
      intervalSeconds: 30,
      groupId: 'screengraph-vibe',
      coolDownMsAfterMax: 120_000,
    },
    check
  );
}


