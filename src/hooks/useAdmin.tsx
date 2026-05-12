
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type AdminRole = 'super_admin' | 'admin' | 'moderator';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, session, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Wait for auth to finish loading before deciding admin status
      if (authLoading) {
        setLoading(true);
        return;
      }

      console.log('Checking admin status for user:', user?.email);

      if (!user || !session) {
        console.log('No user or session found');
        setIsAdmin(false);
        setAdminRole(null);
        setLoading(false);
        return;
      }

      try {
        // Use the new security definer function to check admin status
        const { data: adminStatusData, error: statusError } = await supabase
          .rpc('check_admin_status', { user_id: user.id });

        console.log('Admin status check result:', { adminStatusData, statusError });

        if (statusError) {
          console.error('Error checking admin status:', statusError);
          setIsAdmin(false);
          setAdminRole(null);
        } else if (adminStatusData) {
          // If user is admin, get their role
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_current_admin_role', { user_id: user.id });

          console.log('Admin role check result:', { roleData, roleError });

          if (roleError) {
            console.error('Error getting admin role:', roleError);
            setIsAdmin(true);
            setAdminRole('admin'); // Default fallback
          } else {
            console.log('User is admin with role:', roleData);
            setIsAdmin(true);
            setAdminRole(roleData as AdminRole);
          }
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
  }, [user, session, authLoading]);

  const promoteToAdmin = async (userId: string, role: AdminRole = 'admin') => {
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role: role,
        email: user.email // Store the email properly
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
