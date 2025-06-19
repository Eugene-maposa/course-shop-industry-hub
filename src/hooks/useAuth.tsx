import { useState, useEffect } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Create default user role when user signs up
        if (event === 'SIGNED_UP' && session?.user) {
          setTimeout(async () => {
            try {
              // Check if user already has roles
              const { data: existingRoles } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', session.user.id);
              
              // If no roles exist, get role from metadata or default to 'user'
              if (!existingRoles || existingRoles.length === 0) {
                const userRole = session.user.user_metadata?.role || 'user';
                await supabase
                  .from('user_roles')
                  .insert({
                    user_id: session.user.id,
                    role: userRole,
                  });
              }
            } catch (error) {
              console.error('Error creating default user role:', error);
            }
          }, 1000);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, role: 'user' | 'admin' = 'user') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role: role
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
};
