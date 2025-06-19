
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type AdminRole = 'super_admin' | 'admin' | 'moderator';

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
        // Use raw SQL query to check admin status
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAdminRole(null);
        } else if (data) {
          setIsAdmin(true);
          // Get admin role with another RPC call
          const { data: roleData, error: roleError } = await supabase.rpc('get_admin_role', { user_id: user.id });
          if (!roleError && roleData) {
            setAdminRole(roleData as AdminRole);
          }
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
    if (!user) throw new Error('No authenticated user');

    // Use raw SQL insert through RPC
    const { data, error } = await supabase.rpc('create_admin_user', {
      target_user_id: userId,
      admin_role: role,
      created_by_id: user.id
    });

    if (error) throw error;
    return data;
  };

  const updateAdminRole = async (userId: string, newRole: AdminRole) => {
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase.rpc('update_admin_role', {
      target_user_id: userId,
      new_role: newRole
    });

    if (error) throw error;
    return data;
  };

  const deactivateAdmin = async (userId: string) => {
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase.rpc('deactivate_admin_user', {
      target_user_id: userId
    });

    if (error) throw error;
    return data;
  };

  const logAdminAction = async (action: string, targetTable?: string, targetId?: string, oldValues?: any, newValues?: any) => {
    if (!user) return;

    const { error } = await supabase.rpc('log_admin_action', {
      admin_id: user.id,
      action_type: action,
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
