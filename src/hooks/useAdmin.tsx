
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
      console.log('Checking admin status for user:', user?.email);
      
      if (!user || !session) {
        console.log('No user or session found');
        setIsAdmin(false);
        setAdminRole(null);
        setLoading(false);
        return;
      }

      try {
        // Use direct SQL query to check admin status
        const { data: adminData, error } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        console.log('Admin check result:', { adminData, error });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setAdminRole(null);
        } else if (adminData) {
          console.log('User is admin with role:', adminData.role);
          setIsAdmin(true);
          setAdminRole(adminData.role as AdminRole);
        } else {
          console.log('User is not an admin');
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

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role: role,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateAdminRole = async (userId: string, newRole: AdminRole) => {
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('admin_users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deactivateAdmin = async (userId: string) => {
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('admin_users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
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
        action: action,
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
