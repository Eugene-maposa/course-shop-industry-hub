
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user';

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export const useUserRoles = (user: User | null) => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setUserRoles([]);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const fetchUserRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          return;
        }

        const roles = data?.map((item: UserRoleData) => item.role) || [];
        setUserRoles(roles);
        setIsAdmin(roles.includes('admin'));
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const addRole = async (role: UserRole): Promise<boolean> => {
    if (!user || userRoles.includes(role)) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: role,
        });

      if (error) {
        console.error('Error adding role:', error);
        return false;
      }

      setUserRoles(prev => [...prev, role]);
      if (role === 'admin') setIsAdmin(true);
      return true;
    } catch (error) {
      console.error('Error adding role:', error);
      return false;
    }
  };

  return {
    userRoles,
    loading,
    isAdmin,
    hasRole,
    addRole,
  };
};
