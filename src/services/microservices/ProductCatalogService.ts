/**
 * Product Catalog Microservice
 * Handles product registration, inventory, catalog management, and search
 */

import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  main_image_url?: string;
  gallery_images: any;
  shop_id?: string;
  product_type_id?: string;
  status: 'draft' | 'pending' | 'active' | 'inactive';
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface ProductType {
  id: string;
  name: string;
  description?: string;
  code: string;
  industry_id?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface ProductRegistrationData {
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  shop_id?: string;
  product_type_id?: string;
  main_image?: File;
  gallery_images?: File[];
}

export interface ProductFilter {
  status?: string;
  shop_id?: string;
  product_type_id?: string;
  industry_id?: string;
  price_min?: number;
  price_max?: number;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ProductStats {
  total: number;
  draft: number;
  pending: number;
  active: number;
  inactive: number;
  recentlyAdded: number;
  averagePrice: number;
}

export interface LegalityCheckResult {
  is_legal: boolean;
  violations: string[];
}

class ProductCatalogService {
  private cache: Map<string, Product> = new Map();
  private typeCache: Map<string, ProductType> = new Map();
  private cacheExpiry: number = 300000; // 5 minutes
  private lastCacheUpdate: number = 0;

  // Product CRUD Operations
  async createProduct(productData: ProductRegistrationData): Promise<Product | null> {
    try {
      // Validate required fields
      if (!productData.name) {
        throw new Error('Product name is required');
      }

      // Check product legality
      const legalityCheck = await this.checkProductLegality(
        productData.name,
        productData.description || ''
      );

      if (!legalityCheck.is_legal) {
        throw new Error(`Product contains prohibited content: ${legalityCheck.violations.join(', ')}`);
      }

      // Upload main image if provided
      let mainImageUrl = '';
      if (productData.main_image) {
        mainImageUrl = await this.uploadProductImage(productData.main_image) || '';
      }

      // Upload gallery images if provided
      let galleryImageUrls: string[] = [];
      if (productData.gallery_images && productData.gallery_images.length > 0) {
        galleryImageUrls = await this.uploadGalleryImages(productData.gallery_images);
      }

      // Generate SKU if not provided
      const sku = productData.sku || await this.generateSKU(productData.name, productData.shop_id);

      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          sku: sku,
          price: productData.price,
          main_image_url: mainImageUrl,
          gallery_images: galleryImageUrls,
          shop_id: productData.shop_id,
          product_type_id: productData.product_type_id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  async getProducts(filter?: ProductFilter): Promise<Product[]> {
    try {
      // Check cache first for unfiltered requests
      if (this.shouldUseCache() && !filter) {
        const cached = Array.from(this.cache.values());
        if (cached.length > 0) {
          return cached;
        }
      }

      let query = supabase.from('products').select(`
        *,
        shop:shops(name, id),
        product_type:product_types(name, code)
      `);

      // Apply filters
      if (filter?.status) {
        query = query.eq('status', filter.status as any);
      }

      if (filter?.shop_id) {
        query = query.eq('shop_id', filter.shop_id);
      }

      if (filter?.product_type_id) {
        query = query.eq('product_type_id', filter.product_type_id);
      }

      if (filter?.price_min !== undefined) {
        query = query.gte('price', filter.price_min);
      }

      if (filter?.price_max !== undefined) {
        query = query.lte('price', filter.price_max);
      }

      if (filter?.searchTerm) {
        query = query.or(`name.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%,sku.ilike.%${filter.searchTerm}%`);
      }

      // Apply sorting
      const sortBy = filter?.sort_by || 'created_at';
      const sortOrder = filter?.sort_order === 'asc' ? true : false;
      query = query.order(sortBy, { ascending: sortOrder });

      // Apply pagination
      if (filter?.limit) {
        query = query.limit(filter.limit);
      }

      if (filter?.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Update cache if no filter applied
      if (!filter && data) {
        this.updateCache(data);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      // Check cache first
      if (this.cache.has(id)) {
        return this.cache.get(id) || null;
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shop:shops(name, id, email, phone),
          product_type:product_types(name, code, industry_id)
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
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  async updateProduct(id: string, updates: Partial<ProductRegistrationData>): Promise<Product | null> {
    try {
      // If updating name or description, check legality
      if (updates.name || updates.description) {
        const current = await this.getProductById(id);
        if (!current) throw new Error('Product not found');

        const legalityCheck = await this.checkProductLegality(
          updates.name || current.name,
          updates.description || current.description || ''
        );

        if (!legalityCheck.is_legal) {
          throw new Error(`Product contains prohibited content: ${legalityCheck.violations.join(', ')}`);
        }
      }

      // Handle image uploads
      let updateData: any = { ...updates };

      if (updates.main_image) {
        const imageUrl = await this.uploadProductImage(updates.main_image);
        if (imageUrl) {
          updateData.main_image_url = imageUrl;
        }
        delete updateData.main_image;
      }

      if (updates.gallery_images) {
        const galleryUrls = await this.uploadGalleryImages(updates.gallery_images);
        updateData.gallery_images = galleryUrls;
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
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
      console.error('Error updating product:', error);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      // TODO: Add checks for orders/transactions if implemented

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from cache
      this.cache.delete(id);

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async updateProductStatus(
    productId: string,
    status: 'draft' | 'pending' | 'active' | 'inactive'
  ): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      if (data) {
        this.cache.set(productId, data);
      }

      return data;
    } catch (error) {
      console.error('Error updating product status:', error);
      return null;
    }
  }

  // Product Types Management
  async getProductTypes(industryId?: string): Promise<ProductType[]> {
    try {
      let query = supabase.from('product_types').select('*');

      if (industryId) {
        query = query.eq('industry_id', industryId);
      }

      query = query.eq('status', 'active').order('name', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching product types:', error);
      return [];
    }
  }

  async createProductType(typeData: {
    name: string;
    code: string;
    description?: string;
    industry_id?: string;
  }): Promise<ProductType | null> {
    try {
      const { data, error } = await supabase
        .from('product_types')
        .insert({
          name: typeData.name,
          code: typeData.code.toUpperCase(),
          description: typeData.description,
          industry_id: typeData.industry_id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating product type:', error);
      return null;
    }
  }

  // Product Legality Check
  async checkProductLegality(name: string, description: string = ''): Promise<LegalityCheckResult> {
    try {
      const { data, error } = await supabase.rpc('check_product_legality', {
        product_name: name,
        product_description: description
      });

      if (error) throw error;

      return {
        is_legal: data[0]?.is_legal || false,
        violations: data[0]?.violations || []
      };
    } catch (error) {
      console.error('Error checking product legality:', error);
      return {
        is_legal: false,
        violations: ['Error checking product legality']
      };
    }
  }

  // Image Management
  async uploadProductImage(file: File): Promise<string | null> {
    try {
      if (!this.isValidImageFile(file)) {
        throw new Error('Invalid image file type or size');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading product image:', error);
      return null;
    }
  }

  async uploadGalleryImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadProductImage(file));
    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null) as string[];
  }

  // SKU Generation
  async generateSKU(productName: string, shopId?: string): Promise<string> {
    try {
      // Generate base SKU from product name
      const baseSku = productName
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .substring(0, 6);

      // Add shop prefix if available
      let sku = baseSku;
      if (shopId) {
        sku = `${shopId.substring(0, 3).toUpperCase()}-${baseSku}`;
      }

      // Ensure uniqueness
      let counter = 1;
      let finalSku = sku;

      while (await this.skuExists(finalSku)) {
        finalSku = `${sku}-${counter.toString().padStart(3, '0')}`;
        counter++;
      }

      return finalSku;
    } catch (error) {
      console.error('Error generating SKU:', error);
      return `PROD-${Date.now()}`;
    }
  }

  private async skuExists(sku: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .limit(1);

      return !error && !!data && data.length > 0;
    } catch {
      return false;
    }
  }

  // Product Statistics
  async getProductStats(): Promise<ProductStats> {
    try {
      const [
        totalResult,
        draftResult,
        pendingResult,
        activeResult,
        inactiveResult,
        priceResult
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }).eq('status', 'draft'),
        supabase.from('products').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('products').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('products').select('id', { count: 'exact' }).eq('status', 'inactive'),
        supabase.from('products').select('price').not('price', 'is', null)
      ]);

      // Calculate average price
      const prices = priceResult.data?.map(p => p.price).filter(p => p != null) || [];
      const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

      // Get recently added (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentData } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        total: totalResult.count || 0,
        draft: draftResult.count || 0,
        pending: pendingResult.count || 0,
        active: activeResult.count || 0,
        inactive: inactiveResult.count || 0,
        recentlyAdded: recentData?.length || 0,
        averagePrice: Math.round(averagePrice * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      return {
        total: 0,
        draft: 0,
        pending: 0,
        active: 0,
        inactive: 0,
        recentlyAdded: 0,
        averagePrice: 0
      };
    }
  }

  async getTopProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shop:shops(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  }

  // Search & Discovery
  async searchProducts(searchTerm: string, filters?: Partial<ProductFilter>): Promise<Product[]> {
    return this.getProducts({
      ...filters,
      searchTerm,
      status: filters?.status || 'active'
    });
  }

  async getProductsByCategory(productTypeId: string, limit?: number): Promise<Product[]> {
    return this.getProducts({
      product_type_id: productTypeId,
      status: 'active',
      limit: limit || 20
    });
  }

  async getRelatedProducts(productId: string, limit: number = 5): Promise<Product[]> {
    try {
      const product = await this.getProductById(productId);
      if (!product) return [];

      return this.getProducts({
        product_type_id: product.product_type_id,
        status: 'active',
        limit
      });
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  }

  // Utility Methods
  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  // Cache Management
  private shouldUseCache(): boolean {
    const now = Date.now();
    return now - this.lastCacheUpdate < this.cacheExpiry;
  }

  private updateCache(products: Product[]): void {
    this.cache.clear();
    products.forEach(product => {
      this.cache.set(product.id, product);
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
        .from('products')
        .select('id')
        .limit(1);

      const stats = await this.getProductStats();

      const details = {
        database: error ? 'error' : 'healthy',
        cacheSize: this.cache.size,
        cacheAge: Date.now() - this.lastCacheUpdate,
        totalProducts: stats.total,
        activeProducts: stats.active,
        averagePrice: stats.averagePrice
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
export const productCatalogService = new ProductCatalogService();
export default productCatalogService;