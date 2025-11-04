-- Create theme settings table for system-wide customization
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  category TEXT NOT NULL, -- 'font', 'color', 'size', etc.
  display_name TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read theme settings
CREATE POLICY "Anyone can view theme settings"
  ON public.theme_settings
  FOR SELECT
  USING (true);

-- Only admins can modify theme settings
CREATE POLICY "Only admins can modify theme settings"
  ON public.theme_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Insert default theme settings
INSERT INTO public.theme_settings (setting_key, setting_value, category, display_name, description) VALUES
  -- Font settings
  ('font-family-base', 'Inter, system-ui, sans-serif', 'font', 'Base Font Family', 'Default font for body text'),
  ('font-family-heading', 'Inter, system-ui, sans-serif', 'font', 'Heading Font Family', 'Font for headings'),
  ('font-size-base', '16px', 'font', 'Base Font Size', 'Default text size'),
  ('font-size-sm', '14px', 'font', 'Small Font Size', 'Small text size'),
  ('font-size-lg', '18px', 'font', 'Large Font Size', 'Large text size'),
  ('font-size-xl', '20px', 'font', 'Extra Large Font Size', 'Extra large text size'),
  ('font-size-2xl', '24px', 'font', 'Heading Font Size', 'Heading text size'),
  
  -- Primary colors
  ('color-primary', '210 100% 40%', 'color', 'Primary Color', 'Main brand color (HSL)'),
  ('color-primary-foreground', '210 40% 98%', 'color', 'Primary Foreground', 'Text color on primary background (HSL)'),
  
  -- Secondary colors
  ('color-secondary', '210 40% 96.1%', 'color', 'Secondary Color', 'Secondary brand color (HSL)'),
  ('color-secondary-foreground', '222.2 47.4% 11.2%', 'color', 'Secondary Foreground', 'Text on secondary background (HSL)'),
  
  -- Background colors
  ('color-background', '0 0% 100%', 'color', 'Background Color', 'Main background color (HSL)'),
  ('color-foreground', '222.2 84% 4.9%', 'color', 'Foreground Color', 'Main text color (HSL)'),
  
  -- Card colors
  ('color-card', '0 0% 100%', 'color', 'Card Background', 'Card background color (HSL)'),
  ('color-card-foreground', '222.2 84% 4.9%', 'color', 'Card Text', 'Card text color (HSL)'),
  
  -- Accent colors
  ('color-accent', '210 40% 96.1%', 'color', 'Accent Color', 'Accent color (HSL)'),
  ('color-accent-foreground', '222.2 47.4% 11.2%', 'color', 'Accent Text', 'Text on accent background (HSL)'),
  
  -- Muted colors
  ('color-muted', '210 40% 96.1%', 'color', 'Muted Color', 'Muted background color (HSL)'),
  ('color-muted-foreground', '215.4 16.3% 46.9%', 'color', 'Muted Text', 'Muted text color (HSL)'),
  
  -- Border colors
  ('color-border', '214.3 31.8% 91.4%', 'color', 'Border Color', 'Default border color (HSL)'),
  ('color-input', '214.3 31.8% 91.4%', 'color', 'Input Border', 'Input border color (HSL)'),
  
  -- Destructive colors
  ('color-destructive', '0 84.2% 60.2%', 'color', 'Destructive Color', 'Error/destructive color (HSL)'),
  ('color-destructive-foreground', '210 40% 98%', 'color', 'Destructive Text', 'Text on destructive background (HSL)'),
  
  -- NUST specific colors
  ('color-nust-blue', '203 85% 25%', 'color', 'NUST Blue', 'NUST brand blue (HSL)'),
  ('color-nust-blue-dark', '203 85% 20%', 'color', 'NUST Blue Dark', 'Dark NUST blue (HSL)'),
  ('color-nust-blue-light', '203 85% 35%', 'color', 'NUST Blue Light', 'Light NUST blue (HSL)')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();