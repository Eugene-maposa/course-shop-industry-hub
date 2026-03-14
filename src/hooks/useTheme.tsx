import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ThemeSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  category: string;
  display_name: string;
  description?: string;
}

export const useTheme = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isApplying, setIsApplying] = useState(false);

  // Fetch all theme settings
  const { data: themeSettings = [], isLoading } = useQuery({
    queryKey: ['theme-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });

      if (error) throw error;
      return (data as ThemeSetting[]) || [];
    },
  });

  // Apply theme to document (only fonts - colors are handled via CSS classes for dark mode support)
  useEffect(() => {
    if (themeSettings.length === 0 || isApplying) return;

    setIsApplying(true);
    const root = document.documentElement;

    themeSettings.forEach((setting) => {
      if (setting.category === 'font') {
        if (setting.setting_key === 'font-family-base') {
          root.style.setProperty('--font-sans', setting.setting_value);
          document.body.style.fontFamily = setting.setting_value;
        } else if (setting.setting_key === 'font-family-heading') {
          root.style.setProperty('--font-heading', setting.setting_value);
        } else if (setting.setting_key.startsWith('font-size-')) {
          const varName = setting.setting_key.replace('font-', '--');
          root.style.setProperty(varName, setting.setting_value);
        }
      }
      // NOTE: Color settings are NOT applied as inline styles because they would
      // override the .dark class CSS variables and break dark mode toggling.
    });

    setIsApplying(false);
  }, [themeSettings, isApplying]);

  // Update theme setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({
      settingKey,
      value,
    }: {
      settingKey: string;
      value: string;
    }) => {
      const { data, error } = await supabase
        .from('theme_settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', settingKey)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] });
      toast({
        title: 'Success',
        description: 'Theme setting updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating theme setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update theme setting',
        variant: 'destructive',
      });
    },
  });

  // Batch update mutation
  const batchUpdateMutation = useMutation({
    mutationFn: async (updates: { settingKey: string; value: string }[]) => {
      const promises = updates.map(({ settingKey, value }) =>
        supabase
          .from('theme_settings')
          .update({ setting_value: value, updated_at: new Date().toISOString() })
          .eq('setting_key', settingKey)
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) throw errors[0].error;

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] });
      toast({
        title: 'Success',
        description: 'Theme settings updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating theme settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update theme settings',
        variant: 'destructive',
      });
    },
  });

  // Get settings by category
  const getSettingsByCategory = (category: string) => {
    return themeSettings.filter((s) => s.category === category);
  };

  // Get specific setting
  const getSetting = (settingKey: string) => {
    return themeSettings.find((s) => s.setting_key === settingKey);
  };

  return {
    themeSettings,
    isLoading,
    updateSetting: updateSettingMutation.mutate,
    batchUpdate: batchUpdateMutation.mutate,
    isUpdating: updateSettingMutation.isPending || batchUpdateMutation.isPending,
    getSettingsByCategory,
    getSetting,
  };
};
