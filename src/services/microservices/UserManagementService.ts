/**
 * User Management Microservice
 * Handles user authentication, authorization, profiles, and role management
 */

import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  profile_data?: Record<string, any>;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: any;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AuthResponse {
  user: User | null;
  session: any;
  error?: string;
}

export interface UserManagementConfig {
  maxLoginAttempts: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireEmailVerification: boolean;
}

class UserManagementService {
  private config: UserManagementConfig;
  private loginAttempts: Map<string, number> = new Map();

  constructor() {
    this.config = {
      maxLoginAttempts: 5,
      sessionTimeout: 3600000, // 1 hour
      passwordMinLength: 8,
      requireEmailVerification: true
    };
  }

  // Authentication Methods
  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<AuthResponse> {
    try {
      if (password.length < this.config.passwordMinLength) {
        return {
          user: null,
          session: null,
          error: `Password must be at least ${this.config.passwordMinLength} characters long`
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message
        };
      }

      // Create user role entry
      if (data.user) {
        await this.createUserRole(data.user.id, 'user');
      }

      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Sign up failed'
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Check login attempts
      const attempts = this.loginAttempts.get(email) || 0;
      if (attempts >= this.config.maxLoginAttempts) {
        return {
          user: null,
          session: null,
          error: 'Too many login attempts. Please try again later.'
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Increment login attempts
        this.loginAttempts.set(email, attempts + 1);
        return {
          user: null,
          session: null,
          error: error.message
        };
      }

      // Reset login attempts on successful login
      this.loginAttempts.delete(email);

      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Sign out failed'
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  }

  async refreshSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return {
        user: data.user,
        session: data.session,
        error: error?.message
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Session refresh failed'
      };
    }
  }

  // User Role Management
  async createUserRole(userId: string, role: 'user' | 'admin' | 'super_admin'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as any });

      return !error;
    } catch {
      return false;
    }
  }

  async getUserRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      return error ? null : data.role;
    } catch {
      return null;
    }
  }

  async updateUserRole(userId: string, newRole: 'user' | 'admin' | 'super_admin'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', userId);

      return !error;
    } catch {
      return false;
    }
  }

  // Admin User Management
  async createAdminUser(userEmail: string, role: 'admin' | 'super_admin' = 'admin'): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase.rpc('create_admin_user_safe', {
        user_email: userEmail,
        admin_role: role
      });

      return error ? null : data as any;
    } catch {
      return null;
    }
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return error ? [] : (data as any) || [];
    } catch {
      return [];
    }
  }

  async updateAdminRole(userId: string, newRole: 'admin' | 'super_admin'): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_admin_role', {
        target_user_id: userId,
        new_role: newRole
      });

      return !error;
    } catch {
      return false;
    }
  }

  async deactivateAdminUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('deactivate_admin_user', {
        target_user_id: userId
      });

      return !error;
    } catch {
      return false;
    }
  }

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: userId
      });

      return error ? false : !!data;
    } catch {
      return false;
    }
  }

  async getAdminRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_admin_role', {
        user_id: userId
      });

      return error ? null : data;
    } catch {
      return null;
    }
  }

  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) return null;

      // Get user data from auth
      const user = await this.getCurrentUser();
      if (!user || user.id !== userId) return null;

      return {
        id: userId,
        email: user.email || '',
        created_at: user.created_at || '',
        role: data.role,
        is_active: true,
        profile_data: user.user_metadata
      };
    } catch {
      return null;
    }
  }

  async updateUserProfile(userId: string, profileData: Record<string, any>): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: profileData
      });

      return !error;
    } catch {
      return false;
    }
  }

  // User Statistics
  async getUserCount(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_user_count');
      return error ? 0 : data || 0;
    } catch {
      return 0;
    }
  }

  async getActiveUsersCount(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id', { count: 'exact' });

      return error ? 0 : data?.length || 0;
    } catch {
      return 0;
    }
  }

  // Service Health
  async healthCheck(): Promise<{ status: string; timestamp: string; details: Record<string, any> }> {
    const timestamp = new Date().toISOString();
    
    try {
      // Check database connection
      const { error: dbError } = await supabase
        .from('user_roles')
        .select('id')
        .limit(1);

      // Check auth service
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      const details = {
        database: dbError ? 'error' : 'healthy',
        authentication: authError ? 'error' : 'healthy',
        currentUser: !!user,
        totalUsers: await this.getUserCount(),
        activeAdmins: (await this.getAdminUsers()).length
      };

      const status = dbError || authError ? 'unhealthy' : 'healthy';

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
export const userManagementService = new UserManagementService();
export default userManagementService;