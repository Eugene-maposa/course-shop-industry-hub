import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/useTheme';
import { Palette, Type, Save, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const COMMON_FONTS = [
  'Inter, system-ui, sans-serif',
  'Roboto, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Poppins, sans-serif',
  'Raleway, sans-serif',
  'Nunito, sans-serif',
  'Playfair Display, serif',
  'Merriweather, serif',
  'Georgia, serif',
  'Courier New, monospace',
];

export const ThemeCustomizer = () => {
  const { themeSettings, isLoading, updateSetting, batchUpdate, isUpdating, getSettingsByCategory } = useTheme();
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});

  const fontSettings = getSettingsByCategory('font');
  const colorSettings = getSettingsByCategory('color');

  const handleChange = (settingKey: string, value: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [settingKey]: value,
    }));
  };

  const getCurrentValue = (settingKey: string) => {
    if (pendingChanges[settingKey] !== undefined) {
      return pendingChanges[settingKey];
    }
    const setting = themeSettings.find((s) => s.setting_key === settingKey);
    return setting?.setting_value || '';
  };

  const handleSave = () => {
    const updates = Object.entries(pendingChanges).map(([settingKey, value]) => ({
      settingKey,
      value,
    }));

    if (updates.length > 0) {
      batchUpdate(updates);
      setPendingChanges({});
    }
  };

  const handleReset = () => {
    setPendingChanges({});
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <p className="text-slate-400">Loading theme settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Theme Customization</h2>
          <p className="text-slate-400">Customize the appearance of your entire system</p>
        </div>
        <div className="flex gap-2">
          {hasPendingChanges && (
            <>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isUpdating}
                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {hasPendingChanges && (
        <Badge variant="secondary" className="bg-yellow-500 text-white">
          {Object.keys(pendingChanges).length} unsaved change(s)
        </Badge>
      )}

      <Tabs defaultValue="fonts" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="fonts" className="data-[state=active]:bg-slate-700">
            <Type className="w-4 h-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="colors" className="data-[state=active]:bg-slate-700">
            <Palette className="w-4 h-4 mr-2" />
            Colors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fonts">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Font Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Customize fonts and sizes throughout the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fontSettings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.setting_key} className="text-white">
                    {setting.display_name}
                  </Label>
                  {setting.description && (
                    <p className="text-sm text-slate-400">{setting.description}</p>
                  )}
                  {setting.setting_key.includes('family') ? (
                    <Select
                      value={getCurrentValue(setting.setting_key)}
                      onValueChange={(value) => handleChange(setting.setting_key, value)}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {COMMON_FONTS.map((font) => (
                          <SelectItem key={font} value={font} className="text-white">
                            <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={setting.setting_key}
                      value={getCurrentValue(setting.setting_key)}
                      onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                      placeholder={setting.setting_value}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Colors */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Primary Colors</CardTitle>
                <CardDescription className="text-slate-400">
                  Main brand colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {colorSettings
                  .filter((s) => s.setting_key.includes('primary'))
                  .map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <Label htmlFor={setting.setting_key} className="text-white">
                        {setting.display_name}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={setting.setting_key}
                          value={getCurrentValue(setting.setting_key)}
                          onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                          placeholder="H S L (e.g., 210 100% 40%)"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <div
                          className="w-12 h-10 rounded border border-slate-600"
                          style={{ backgroundColor: `hsl(${getCurrentValue(setting.setting_key)})` }}
                        />
                      </div>
                      {setting.description && (
                        <p className="text-xs text-slate-400">{setting.description}</p>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Secondary Colors */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Secondary Colors</CardTitle>
                <CardDescription className="text-slate-400">
                  Secondary brand colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {colorSettings
                  .filter((s) => s.setting_key.includes('secondary'))
                  .map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <Label htmlFor={setting.setting_key} className="text-white">
                        {setting.display_name}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={setting.setting_key}
                          value={getCurrentValue(setting.setting_key)}
                          onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                          placeholder="H S L (e.g., 210 40% 96%)"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <div
                          className="w-12 h-10 rounded border border-slate-600"
                          style={{ backgroundColor: `hsl(${getCurrentValue(setting.setting_key)})` }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Background Colors */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Background Colors</CardTitle>
                <CardDescription className="text-slate-400">
                  Main background colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {colorSettings
                  .filter((s) => s.setting_key.includes('background') || s.setting_key.includes('foreground'))
                  .map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <Label htmlFor={setting.setting_key} className="text-white">
                        {setting.display_name}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={setting.setting_key}
                          value={getCurrentValue(setting.setting_key)}
                          onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                          placeholder="H S L"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <div
                          className="w-12 h-10 rounded border border-slate-600"
                          style={{ backgroundColor: `hsl(${getCurrentValue(setting.setting_key)})` }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Accent & Utility Colors */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Accent & Utility</CardTitle>
                <CardDescription className="text-slate-400">
                  Accent, muted, and utility colors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {colorSettings
                  .filter(
                    (s) =>
                      s.setting_key.includes('accent') ||
                      s.setting_key.includes('muted') ||
                      s.setting_key.includes('border') ||
                      s.setting_key.includes('input')
                  )
                  .map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <Label htmlFor={setting.setting_key} className="text-white">
                        {setting.display_name}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={setting.setting_key}
                          value={getCurrentValue(setting.setting_key)}
                          onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                          placeholder="H S L"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <div
                          className="w-12 h-10 rounded border border-slate-600"
                          style={{ backgroundColor: `hsl(${getCurrentValue(setting.setting_key)})` }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* NUST Colors */}
            <Card className="bg-slate-800 border-slate-700 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">NUST Brand Colors</CardTitle>
                <CardDescription className="text-slate-400">
                  NUST-specific brand colors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {colorSettings
                    .filter((s) => s.setting_key.includes('nust'))
                    .map((setting) => (
                      <div key={setting.id} className="space-y-2">
                        <Label htmlFor={setting.setting_key} className="text-white">
                          {setting.display_name}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={setting.setting_key}
                            value={getCurrentValue(setting.setting_key)}
                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                            placeholder="H S L"
                            className="bg-slate-700 border-slate-600 text-white flex-1"
                          />
                          <div
                            className="w-12 h-10 rounded border border-slate-600"
                            style={{ backgroundColor: `hsl(${getCurrentValue(setting.setting_key)})` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
