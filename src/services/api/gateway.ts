/**
 * API Gateway - Central entry point for all microservice communications
 * Handles routing, authentication, rate limiting, and service discovery
 */

import { supabase } from "@/integrations/supabase/client";

export interface ServiceEndpoint {
  name: string;
  baseUrl: string;
  version: string;
  healthCheck: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  service: string;
  timestamp: string;
}

class APIGateway {
  private services: Map<string, ServiceEndpoint> = new Map();
  private rateLimiter: Map<string, number[]> = new Map();
  private readonly maxRequestsPerMinute = 100;

  constructor() {
    this.registerServices();
  }

  private registerServices() {
    // Register all microservices
    this.services.set('user-management', {
      name: 'User Management Service',
      baseUrl: '/api/users',
      version: 'v1',
      healthCheck: '/health'
    });

    this.services.set('industry-management', {
      name: 'Industry Management Service', 
      baseUrl: '/api/industries',
      version: 'v1',
      healthCheck: '/health'
    });

    this.services.set('shop-management', {
      name: 'Shop Management Service',
      baseUrl: '/api/shops',
      version: 'v1',
      healthCheck: '/health'
    });

    this.services.set('product-catalog', {
      name: 'Product Catalog Service',
      baseUrl: '/api/products',
      version: 'v1',
      healthCheck: '/health'
    });

    this.services.set('document-processing', {
      name: 'Document Processing Service',
      baseUrl: '/api/documents',
      version: 'v1',
      healthCheck: '/health'
    });

    this.services.set('notification', {
      name: 'Notification Service',
      baseUrl: '/api/notifications',
      version: 'v1',
      healthCheck: '/health'
    });

    this.services.set('audit-logging', {
      name: 'Audit & Logging Service',
      baseUrl: '/api/audit',
      version: 'v1',
      healthCheck: '/health'
    });

    this.services.set('search-discovery', {
      name: 'Search & Discovery Service',
      baseUrl: '/api/search',
      version: 'v1',
      healthCheck: '/health'
    });

    this.services.set('reporting-analytics', {
      name: 'Reporting & Analytics Service',
      baseUrl: '/api/analytics',
      version: 'v1',
      healthCheck: '/health'
    });
  }

  private checkRateLimit(serviceName: string): boolean {
    const now = Date.now();
    const userRequests = this.rateLimiter.get(serviceName) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      return false;
    }

    recentRequests.push(now);
    this.rateLimiter.set(serviceName, recentRequests);
    return true;
  }

  private async validateAuthentication(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch {
      return false;
    }
  }

  async routeRequest<T>(
    serviceName: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const timestamp = new Date().toISOString();
    
    try {
      // Rate limiting check
      if (!this.checkRateLimit(serviceName)) {
        return {
          error: 'Rate limit exceeded. Please try again later.',
          status: 429,
          service: serviceName,
          timestamp
        };
      }

      // Authentication check
      if (requireAuth && !(await this.validateAuthentication())) {
        return {
          error: 'Authentication required',
          status: 401,
          service: serviceName,
          timestamp
        };
      }

      // Service discovery
      const service = this.services.get(serviceName);
      if (!service) {
        return {
          error: `Service '${serviceName}' not found`,
          status: 404,
          service: serviceName,
          timestamp
        };
      }

      // Route to appropriate service
      const response = await this.executeServiceCall<T>(
        service,
        endpoint,
        method,
        data
      );

      return {
        data: response,
        status: 200,
        service: serviceName,
        timestamp
      };

    } catch (error) {
      console.error(`API Gateway Error for ${serviceName}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500,
        service: serviceName,
        timestamp
      };
    }
  }

  private async executeServiceCall<T>(
    service: ServiceEndpoint,
    endpoint: string,
    method: string,
    data?: any
  ): Promise<T> {
    // This is where we would route to actual microservices
    // For now, we'll route to Supabase functions that act as our microservices
    
    const functionName = this.getSupabaseFunctionName(service.name, endpoint);
    
    if (method === 'GET') {
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: { action: 'get', endpoint, params: data }
      });
      
      if (error) throw error;
      return result;
    } else {
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: { action: method.toLowerCase(), endpoint, data }
      });
      
      if (error) throw error;
      return result;
    }
  }

  private getSupabaseFunctionName(serviceName: string, endpoint: string): string {
    // Map service names to Supabase function names
    const serviceMap: Record<string, string> = {
      'User Management Service': 'user-service',
      'Industry Management Service': 'industry-service',
      'Shop Management Service': 'shop-service',
      'Product Catalog Service': 'product-service',
      'Document Processing Service': 'document-service',
      'Notification Service': 'notification-service',
      'Audit & Logging Service': 'audit-service',
      'Search & Discovery Service': 'search-service',
      'Reporting & Analytics Service': 'analytics-service'
    };

    return serviceMap[serviceName] || 'default-service';
  }

  async healthCheck(): Promise<Record<string, any>> {
    const healthStatus: Record<string, any> = {};

    for (const [name, service] of this.services) {
      try {
        const response = await this.routeRequest(
          name,
          service.healthCheck,
          'GET',
          null,
          false
        );
        
        healthStatus[name] = {
          status: response.status === 200 ? 'healthy' : 'unhealthy',
          lastCheck: response.timestamp,
          version: service.version
        };
      } catch (error) {
        healthStatus[name] = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString(),
          version: service.version
        };
      }
    }

    return healthStatus;
  }

  getServiceEndpoints(): ServiceEndpoint[] {
    return Array.from(this.services.values());
  }

  getServiceByName(name: string): ServiceEndpoint | undefined {
    return this.services.get(name);
  }
}

// Singleton instance
export const apiGateway = new APIGateway();

// Export convenience methods
export const serviceCall = <T>(
  service: string,
  endpoint: string,
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
  requireAuth?: boolean
) => apiGateway.routeRequest<T>(service, endpoint, method, data, requireAuth);

export default apiGateway;