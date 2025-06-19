
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type AdminRole = 'super_admin' | 'admin' | 'moderator';

interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !session) {
        setIsAdmin(false);
        setAdminRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAdminRole(null);
        } else if (data) {
          setIsAdmin(true);
          setAdminRole(data.role);
        } else {
          setIsAdmin(false);
          setAdminRole(null);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminRole(null);
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, [user, session]);

  const promoteToAdmin = async (userId: string, role: AdminRole = 'admin') => {
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role,
        created_by: user?.id,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateAdminRole = async (userId: string, newRole: AdminRole) => {
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deactivateAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from('admin_users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const logAdminAction = async (action: string, targetTable?: string, targetId?: string, oldValues?: any, newValues?: any) => {
    if (!user) return;

    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_user_id: user.id,
        action,
        target_table: targetTable,
        target_id: targetId,
        old_values: oldValues,
        new_values: newValues
      });

    if (error) {
      console.error('Error logging admin action:', error);
    }
  };

  return {
    isAdmin,
    adminRole,
    loading,
    promoteToAdmin,
    updateAdminRole,
    deactivateAdmin,
    logAdminAction
  };
};
