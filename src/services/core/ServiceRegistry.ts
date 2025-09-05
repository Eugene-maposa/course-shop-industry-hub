/**
 * Service Registry - Central registry for microservice instances
 * Manages service discovery, health monitoring, and lifecycle
 */

import { apiGateway } from "../api/gateway";
import { userManagementService } from "../microservices/UserManagementService";
import { industryManagementService } from "../microservices/IndustryManagementService";
import { shopManagementService } from "../microservices/ShopManagementService";
import { productCatalogService } from "../microservices/ProductCatalogService";

export interface ServiceInfo {
  name: string;
  version: string;
  status: 'healthy' | 'unhealthy' | 'error';
  lastHealthCheck: string;
  instance: any;
}

export interface ServiceMetrics {
  uptime: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
}

class ServiceRegistry {
  private services: Map<string, ServiceInfo> = new Map();
  private metrics: Map<string, ServiceMetrics> = new Map();
  private healthCheckInterval: number = 30000; // 30 seconds
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.registerServices();
    this.startHealthChecking();
  }

  private registerServices() {
    // Register all microservices
    this.registerService('user-management', '1.0.0', userManagementService);
    this.registerService('industry-management', '1.0.0', industryManagementService);
    this.registerService('shop-management', '1.0.0', shopManagementService);
    this.registerService('product-catalog', '1.0.0', productCatalogService);
    this.registerService('api-gateway', '1.0.0', apiGateway);
  }

  private registerService(name: string, version: string, instance: any) {
    const serviceInfo: ServiceInfo = {
      name,
      version,
      status: 'healthy',
      lastHealthCheck: new Date().toISOString(),
      instance
    };

    this.services.set(name, serviceInfo);
    
    // Initialize metrics
    this.metrics.set(name, {
      uptime: Date.now(),
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0
    });
  }

  private startHealthChecking() {
    this.intervalId = setInterval(async () => {
      await this.performHealthChecks();
    }, this.healthCheckInterval);
  }

  private async performHealthChecks() {
    const healthPromises = Array.from(this.services.entries()).map(
      async ([serviceName, serviceInfo]) => {
        try {
          if (serviceInfo.instance.healthCheck) {
            const health = await serviceInfo.instance.healthCheck();
            serviceInfo.status = health.status === 'healthy' ? 'healthy' : 'unhealthy';
          } else {
            serviceInfo.status = 'healthy'; // Assume healthy if no health check
          }
          serviceInfo.lastHealthCheck = new Date().toISOString();
        } catch (error) {
          console.error(`Health check failed for ${serviceName}:`, error);
          serviceInfo.status = 'error';
          serviceInfo.lastHealthCheck = new Date().toISOString();
          
          // Increment error count
          const metrics = this.metrics.get(serviceName);
          if (metrics) {
            metrics.errorCount++;
          }
        }
      }
    );

    await Promise.all(healthPromises);
  }

  // Service Discovery
  getService<T>(serviceName: string): T | null {
    const serviceInfo = this.services.get(serviceName);
    return serviceInfo ? serviceInfo.instance as T : null;
  }

  getServiceInfo(serviceName: string): ServiceInfo | null {
    return this.services.get(serviceName) || null;
  }

  getAllServices(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  getHealthyServices(): ServiceInfo[] {
    return Array.from(this.services.values()).filter(
      service => service.status === 'healthy'
    );
  }

  getUnhealthyServices(): ServiceInfo[] {
    return Array.from(this.services.values()).filter(
      service => service.status !== 'healthy'
    );
  }

  // Service Metrics
  recordRequest(serviceName: string, responseTime: number, success: boolean = true) {
    const metrics = this.metrics.get(serviceName);
    if (!metrics) return;

    metrics.requestCount++;
    if (!success) {
      metrics.errorCount++;
    }

    // Update average response time
    metrics.averageResponseTime = 
      (metrics.averageResponseTime * (metrics.requestCount - 1) + responseTime) / 
      metrics.requestCount;
  }

  getMetrics(serviceName: string): ServiceMetrics | null {
    return this.metrics.get(serviceName) || null;
  }

  getAllMetrics(): Record<string, ServiceMetrics> {
    const allMetrics: Record<string, ServiceMetrics> = {};
    this.metrics.forEach((metrics, serviceName) => {
      allMetrics[serviceName] = {
        ...metrics,
        uptime: Date.now() - metrics.uptime
      };
    });
    return allMetrics;
  }

  // Circuit Breaker Pattern
  isServiceAvailable(serviceName: string): boolean {
    const serviceInfo = this.services.get(serviceName);
    if (!serviceInfo) return false;

    const metrics = this.metrics.get(serviceName);
    if (!metrics) return true;

    // Simple circuit breaker logic
    const errorRate = metrics.errorCount / Math.max(metrics.requestCount, 1);
    const isHealthy = serviceInfo.status === 'healthy';
    const lowErrorRate = errorRate < 0.1; // Less than 10% error rate

    return isHealthy && lowErrorRate;
  }

  // Service Communication
  async callService<T>(
    serviceName: string,
    method: string,
    ...args: any[]
  ): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      if (!this.isServiceAvailable(serviceName)) {
        throw new Error(`Service ${serviceName} is not available`);
      }

      const service = this.getService(serviceName);
      if (!service || typeof service[method] !== 'function') {
        throw new Error(`Method ${method} not found on service ${serviceName}`);
      }

      const result = await service[method](...args);
      const responseTime = Date.now() - startTime;
      
      this.recordRequest(serviceName, responseTime, true);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordRequest(serviceName, responseTime, false);
      
      console.error(`Service call failed: ${serviceName}.${method}`, error);
      return null;
    }
  }

  // Service Lifecycle
  restartService(serviceName: string): boolean {
    try {
      const serviceInfo = this.services.get(serviceName);
      if (!serviceInfo) return false;

      // Reset metrics
      const metrics = this.metrics.get(serviceName);
      if (metrics) {
        metrics.uptime = Date.now();
        metrics.requestCount = 0;
        metrics.errorCount = 0;
        metrics.averageResponseTime = 0;
      }

      serviceInfo.status = 'healthy';
      serviceInfo.lastHealthCheck = new Date().toISOString();

      return true;
    } catch (error) {
      console.error(`Failed to restart service ${serviceName}:`, error);
      return false;
    }
  }

  deregisterService(serviceName: string): boolean {
    try {
      this.services.delete(serviceName);
      this.metrics.delete(serviceName);
      return true;
    } catch (error) {
      console.error(`Failed to deregister service ${serviceName}:`, error);
      return false;
    }
  }

  // System Overview
  getSystemHealth(): {
    overall: 'healthy' | 'degraded' | 'critical';
    services: number;
    healthy: number;
    unhealthy: number;
    totalRequests: number;
    totalErrors: number;
    uptime: number;
  } {
    const services = this.getAllServices();
    const metrics = this.getAllMetrics();
    
    const healthy = services.filter(s => s.status === 'healthy').length;
    const unhealthy = services.length - healthy;
    
    const totalRequests = Object.values(metrics).reduce(
      (sum, m) => sum + m.requestCount, 0
    );
    const totalErrors = Object.values(metrics).reduce(
      (sum, m) => sum + m.errorCount, 0
    );

    let overall: 'healthy' | 'degraded' | 'critical';
    if (unhealthy === 0) {
      overall = 'healthy';
    } else if (unhealthy < services.length / 2) {
      overall = 'degraded';
    } else {
      overall = 'critical';
    }

    return {
      overall,
      services: services.length,
      healthy,
      unhealthy,
      totalRequests,
      totalErrors,
      uptime: Date.now() - Math.min(...Object.values(metrics).map(m => m.uptime))
    };
  }

  // Cleanup
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.services.clear();
    this.metrics.clear();
  }
}

// Singleton instance
export const serviceRegistry = new ServiceRegistry();

// Export convenience methods
export const getService = <T>(serviceName: string): T | null => 
  serviceRegistry.getService<T>(serviceName);

export const callService = <T>(serviceName: string, method: string, ...args: any[]): Promise<T | null> =>
  serviceRegistry.callService<T>(serviceName, method, ...args);

export const isServiceAvailable = (serviceName: string): boolean =>
  serviceRegistry.isServiceAvailable(serviceName);

export default serviceRegistry;