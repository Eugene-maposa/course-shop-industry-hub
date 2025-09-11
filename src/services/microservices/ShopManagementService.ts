/**
 * Shop Management Microservice
 * Handles shop registration, verification, and lifecycle management
 */

import { supabase } from "@/integrations/supabase/client";

export interface Shop {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  icon_url?: string;
  industry_id?: string;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  document_verification_status: any;
  verification_notes?: string;
  documents: any;
  verified_by?: string;
  verified_at?: string;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface ShopRegistrationData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry_id?: string;
  documents?: Record<string, any>;
}

export interface ShopFilter {
  status?: string;
  industry_id?: string;
  verification_status?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface ShopStats {
  total: number;
  pending: number;
  active: number;
  inactive: number;
  suspended: number;
  pendingVerification: number;
  approved: number;
  rejected: number;
}

export interface DocumentRequirement {
  id: string;
  document_type: string;
  document_name: string;
  description?: string;
  is_required: boolean;
  country_code: string;
}

class ShopManagementService {
  private cache: Map<string, Shop> = new Map();
  private cacheExpiry: number = 300000; // 5 minutes
  private lastCacheUpdate: number = 0;

  // Shop CRUD Operations
  async createShop(shopData: ShopRegistrationData): Promise<Shop | null> {
    try {
      // Validate required fields
      if (!shopData.name) {
        throw new Error('Shop name is required');
      }

      // Validate email format if provided
      if (shopData.email && !this.isValidEmail(shopData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate website URL if provided
      if (shopData.website && !this.isValidUrl(shopData.website)) {
        throw new Error('Invalid website URL format');
      }

      const { data, error } = await supabase
        .from('shops')
        .insert({
          name: shopData.name,
          description: shopData.description,
          address: shopData.address,
          phone: shopData.phone,
          email: shopData.email,
          website: shopData.website,
          industry_id: shopData.industry_id,
          documents: shopData.documents || {},
          status: 'pending',
          document_verification_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error creating shop:', error);
      return null;
    }
  }

  async getShops(filter?: ShopFilter): Promise<Shop[]> {
    try {
      // Check cache first for unfiltered requests
      if (this.shouldUseCache() && !filter) {
        const cached = Array.from(this.cache.values());
        if (cached.length > 0) {
          return cached;
        }
      }

      let query = supabase.from('shops').select(`
        *,
        industry:industries(name, code)
      `);

      // Apply filters
      if (filter?.status) {
        query = query.eq('status', filter.status as any);
      }

      if (filter?.industry_id) {
        query = query.eq('industry_id', filter.industry_id);
      }

      if (filter?.verification_status) {
        query = query.eq('document_verification_status', filter.verification_status);
      }

      if (filter?.searchTerm) {
        query = query.or(`name.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%,email.ilike.%${filter.searchTerm}%`);
      }

      // Apply pagination
      if (filter?.limit) {
        query = query.limit(filter.limit);
      }

      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }

      // Order by created date (newest first)
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Update cache if no filter applied
      if (!filter && data) {
        this.updateCache(data);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching shops:', error);
      return [];
    }
  }

  async getShopById(id: string): Promise<Shop | null> {
    try {
      // Check cache first
      if (this.cache.has(id)) {
        return this.cache.get(id) || null;
      }

      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          industry:industries(name, code)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Update cache
      if (data) {
        this.cache.set(id, data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching shop by ID:', error);
      return null;
    }
  }

  async updateShop(id: string, updates: Partial<ShopRegistrationData>): Promise<Shop | null> {
    try {
      // Validate email format if updating
      if (updates.email && !this.isValidEmail(updates.email)) {
        throw new Error('Invalid email format');
      }

      // Validate website URL if updating
      if (updates.website && !this.isValidUrl(updates.website)) {
        throw new Error('Invalid website URL format');
      }

      const { data, error } = await supabase
        .from('shops')
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
      console.error('Error updating shop:', error);
      return null;
    }
  }

  async deleteShop(id: string): Promise<boolean> {
    try {
      // Check if shop has products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('shop_id', id)
        .limit(1);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        throw new Error('Cannot delete shop that has products');
      }

      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from cache
      this.cache.delete(id);

      return true;
    } catch (error) {
      console.error('Error deleting shop:', error);
      return false;
    }
  }

  // Shop Verification
  async updateVerificationStatus(
    shopId: string,
    status: 'pending' | 'approved' | 'rejected' | 'requires_review',
    notes?: string,
    verifiedBy?: string
  ): Promise<Shop | null> {
    try {
      const updateData: any = {
        document_verification_status: status,
        verification_notes: notes,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved' && verifiedBy) {
        updateData.verified_by = verifiedBy;
        updateData.verified_at = new Date().toISOString();
        updateData.status = 'active'; // Automatically activate approved shops
      }

      const { data, error } = await supabase
        .from('shops')
        .update(updateData)
        .eq('id', shopId)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      if (data) {
        this.cache.set(shopId, data);
      }

      return data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      return null;
    }
  }

  async updateShopStatus(
    shopId: string,
    status: 'pending' | 'active' | 'inactive'
  ): Promise<Shop | null> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', shopId)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      if (data) {
        this.cache.set(shopId, data);
      }

      return data;
    } catch (error) {
      console.error('Error updating shop status:', error);
      return null;
    }
  }

  // Document Management
  async getDocumentRequirements(countryCode: string = 'ZW'): Promise<DocumentRequirement[]> {
    try {
      const { data, error } = await supabase
        .from('shop_document_requirements')
        .select('*')
        .eq('country_code', countryCode)
        .eq('is_required', true)
        .order('document_type', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching document requirements:', error);
      return [];
    }
  }

  async uploadShopDocument(
    shopId: string,
    documentType: string,
    file: File
  ): Promise<string | null> {
    try {
      // Validate file
      if (!this.isValidDocumentFile(file)) {
        throw new Error('Invalid document file type or size');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${shopId}/${documentType}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('shop-documents')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('shop-documents')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading shop document:', error);
      return null;
    }
  }

  async updateShopDocuments(shopId: string, documents: Record<string, any>): Promise<Shop | null> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .update({
          documents,
          updated_at: new Date().toISOString()
        })
        .eq('id', shopId)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      if (data) {
        this.cache.set(shopId, data);
      }

      return data;
    } catch (error) {
      console.error('Error updating shop documents:', error);
      return null;
    }
  }

  // Shop Statistics
  async getShopStats(): Promise<ShopStats> {
    try {
      const [
        totalResult,
        pendingResult,
        activeResult,
        inactiveResult,
        suspendedResult,
        pendingVerificationResult,
        approvedResult,
        rejectedResult
      ] = await Promise.all([
        supabase.from('shops').select('id', { count: 'exact' }),
        supabase.from('shops').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('shops').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('shops').select('id', { count: 'exact' }).eq('status', 'inactive'),
        supabase.from('shops').select('id', { count: 'exact' }).eq('status', 'suspended' as any),
        supabase.from('shops').select('id', { count: 'exact' }).eq('document_verification_status', 'pending' as any),
        supabase.from('shops').select('id', { count: 'exact' }).eq('document_verification_status', 'approved' as any),
        supabase.from('shops').select('id', { count: 'exact' }).eq('document_verification_status', 'rejected')
      ]);

      return {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        active: activeResult.count || 0,
        inactive: inactiveResult.count || 0,
        suspended: suspendedResult.count || 0,
        pendingVerification: pendingVerificationResult.count || 0,
        approved: approvedResult.count || 0,
        rejected: rejectedResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching shop stats:', error);
      return {
        total: 0,
        pending: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        pendingVerification: 0,
        approved: 0,
        rejected: 0
      };
    }
  }

  async getShopsByIndustry(): Promise<Array<{ industry: string; count: number }>> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          industry_id,
          industry:industries(name)
        `)
        .eq('status', 'active');

      if (error) throw error;

      // Group by industry
      const industryMap = new Map<string, number>();
      data?.forEach(shop => {
        const industryName = shop.industry?.name || 'Uncategorized';
        industryMap.set(industryName, (industryMap.get(industryName) || 0) + 1);
      });

      return Array.from(industryMap.entries()).map(([industry, count]) => ({
        industry,
        count
      }));
    } catch (error) {
      console.error('Error fetching shops by industry:', error);
      return [];
    }
  }

  // Utility Methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidDocumentFile(file: File): boolean {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  // Cache Management
  private shouldUseCache(): boolean {
    const now = Date.now();
    return now - this.lastCacheUpdate < this.cacheExpiry;
  }

  private updateCache(shops: Shop[]): void {
    this.cache.clear();
    shops.forEach(shop => {
      this.cache.set(shop.id, shop);
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
        .from('shops')
        .select('id')
        .limit(1);

      const stats = await this.getShopStats();

      const details = {
        database: error ? 'error' : 'healthy',
        cacheSize: this.cache.size,
        cacheAge: Date.now() - this.lastCacheUpdate,
        totalShops: stats.total,
        activeShops: stats.active,
        pendingVerification: stats.pendingVerification
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
export const shopManagementService = new ShopManagementService();
export default shopManagementService;