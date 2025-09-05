/**
 * Industry Management Microservice
 * Handles industry registration, classification, and management
 */

import { supabase } from "@/integrations/supabase/client";

export interface Industry {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface IndustryRegistrationData {
  name: string;
  code: string;
  description?: string;
}

export interface IndustryFilter {
  status?: 'active' | 'inactive';
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface IndustryStats {
  total: number;
  active: number;
  inactive: number;
  recentlyAdded: number;
}

class IndustryManagementService {
  private cache: Map<string, Industry> = new Map();
  private cacheExpiry: number = 300000; // 5 minutes
  private lastCacheUpdate: number = 0;

  // Industry CRUD Operations
  async createIndustry(industryData: IndustryRegistrationData): Promise<Industry | null> {
    try {
      // Validate input
      if (!industryData.name || !industryData.code) {
        throw new Error('Industry name and code are required');
      }

      // Check if code already exists
      const existing = await this.getIndustryByCode(industryData.code);
      if (existing) {
        throw new Error('Industry code already exists');
      }

      const { data, error } = await supabase
        .from('industries')
        .insert({
          name: industryData.name,
          code: industryData.code.toUpperCase(),
          description: industryData.description,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error creating industry:', error);
      return null;
    }
  }

  async getIndustries(filter?: IndustryFilter): Promise<Industry[]> {
    try {
      // Check cache first
      if (this.shouldUseCache() && !filter) {
        const cached = Array.from(this.cache.values());
        if (cached.length > 0) {
          return cached;
        }
      }

      let query = supabase.from('industries').select('*');

      // Apply filters
      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.searchTerm) {
        query = query.or(`name.ilike.%${filter.searchTerm}%,code.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`);
      }

      // Apply pagination
      if (filter?.limit) {
        query = query.limit(filter.limit);
      }

      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }

      // Order by name
      query = query.order('name', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      // Update cache if no filter applied
      if (!filter && data) {
        this.updateCache(data);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching industries:', error);
      return [];
    }
  }

  async getIndustryById(id: string): Promise<Industry | null> {
    try {
      // Check cache first
      if (this.cache.has(id)) {
        return this.cache.get(id) || null;
      }

      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Update cache
      if (data) {
        this.cache.set(id, data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching industry by ID:', error);
      return null;
    }
  }

  async getIndustryByCode(code: string): Promise<Industry | null> {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

      return data || null;
    } catch (error) {
      console.error('Error fetching industry by code:', error);
      return null;
    }
  }

  async updateIndustry(id: string, updates: Partial<IndustryRegistrationData>): Promise<Industry | null> {
    try {
      // If updating code, check for duplicates
      if (updates.code) {
        const existing = await this.getIndustryByCode(updates.code);
        if (existing && existing.id !== id) {
          throw new Error('Industry code already exists');
        }
        updates.code = updates.code.toUpperCase();
      }

      const { data, error } = await supabase
        .from('industries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      if (data) {
        this.cache.set(id, data);
      }

      return data;
    } catch (error) {
      console.error('Error updating industry:', error);
      return null;
    }
  }

  async deleteIndustry(id: string): Promise<boolean> {
    try {
      // Check if industry is being used by shops
      const { data: shops, error: shopsError } = await supabase
        .from('shops')
        .select('id')
        .eq('industry_id', id)
        .limit(1);

      if (shopsError) throw shopsError;

      if (shops && shops.length > 0) {
        throw new Error('Cannot delete industry that is being used by shops');
      }

      const { error } = await supabase
        .from('industries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from cache
      this.cache.delete(id);

      return true;
    } catch (error) {
      console.error('Error deleting industry:', error);
      return false;
    }
  }

  async toggleIndustryStatus(id: string): Promise<Industry | null> {
    try {
      const industry = await this.getIndustryById(id);
      if (!industry) return null;

      const newStatus = industry.status === 'active' ? 'inactive' : 'active';
      
      return await this.updateIndustry(id, { status: newStatus } as any);
    } catch (error) {
      console.error('Error toggling industry status:', error);
      return null;
    }
  }

  // Industry Statistics
  async getIndustryStats(): Promise<IndustryStats> {
    try {
      const [totalResult, activeResult, inactiveResult] = await Promise.all([
        supabase.from('industries').select('id', { count: 'exact' }),
        supabase.from('industries').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('industries').select('id', { count: 'exact' }).eq('status', 'inactive')
      ]);

      // Get recently added (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentData } = await supabase
        .from('industries')
        .select('id', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        inactive: inactiveResult.count || 0,
        recentlyAdded: recentData?.length || 0
      };
    } catch (error) {
      console.error('Error fetching industry stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        recentlyAdded: 0
      };
    }
  }

  async getTopIndustries(limit: number = 10): Promise<Array<Industry & { shopCount: number }>> {
    try {
      // Get industries with shop counts
      const { data, error } = await supabase
        .from('industries')
        .select(`
          *,
          shops:shops(count)
        `)
        .eq('status', 'active')
        .order('shops.count', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(industry => ({
        ...industry,
        shopCount: industry.shops?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error fetching top industries:', error);
      return [];
    }
  }

  // Industry Code Generation
  generateIndustryCode(industryName: string): string {
    // Generate a 3-letter code from industry name
    const words = industryName.trim().split(/\s+/);
    let code = '';

    if (words.length === 1) {
      // Single word - take first 3 letters
      code = words[0].substring(0, 3);
    } else if (words.length === 2) {
      // Two words - take first 2 letters of first word, first letter of second
      code = words[0].substring(0, 2) + words[1].substring(0, 1);
    } else {
      // Three or more words - take first letter of each (up to 3)
      code = words.slice(0, 3).map(word => word[0]).join('');
    }

    return code.toUpperCase();
  }

  async generateUniqueCode(industryName: string): Promise<string> {
    const baseCode = this.generateIndustryCode(industryName);
    let code = baseCode;
    let counter = 1;

    // Check if code exists, if so, append number
    while (await this.getIndustryByCode(code)) {
      code = baseCode + counter.toString().padStart(2, '0');
      counter++;
    }

    return code;
  }

  // Cache Management
  private shouldUseCache(): boolean {
    const now = Date.now();
    return now - this.lastCacheUpdate < this.cacheExpiry;
  }

  private updateCache(industries: Industry[]): void {
    this.cache.clear();
    industries.forEach(industry => {
      this.cache.set(industry.id, industry);
    });
    this.lastCacheUpdate = Date.now();
  }

  private clearCache(): void {
    this.cache.clear();
    this.lastCacheUpdate = 0;
  }

  // Service Health
  async healthCheck(): Promise<{ status: string; timestamp: string; details: Record<string, any> }> {
    const timestamp = new Date().toISOString();
    
    try {
      // Test database connection
      const { data, error } = await supabase
        .from('industries')
        .select('id')
        .limit(1);

      const stats = await this.getIndustryStats();

      const details = {
        database: error ? 'error' : 'healthy',
        cacheSize: this.cache.size,
        cacheAge: Date.now() - this.lastCacheUpdate,
        totalIndustries: stats.total,
        activeIndustries: stats.active
      };

      const status = error ? 'unhealthy' : 'healthy';

      return { status, timestamp, details };
    } catch (error) {
      return {
        status: 'error',
        timestamp,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}

// Singleton instance
export const industryManagementService = new IndustryManagementService();
export default industryManagementService;