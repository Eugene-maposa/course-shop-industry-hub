import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

interface UserProfileData {
  id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
  date_of_birth?: string;
  company?: string;
  website?: string;
}

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({});

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Since user_profiles table might not exist yet in the types, we'll use any
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpdate = (url: string) => {
    handleInputChange('avatar_url', url);
  };

  const initials = `${profileData.first_name?.[0] || ''}${profileData.last_name?.[0] || ''}`.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-4 h-4" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-xs">
            Update your personal details and profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Section */}
          <ProfilePhotoUpload
            currentAvatar={profileData.avatar_url}
            initials={initials}
            userId={user?.id || ''}
            onAvatarUpdate={handleAvatarUpdate}
          />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-xs">First Name</Label>
              <Input
                id="firstName"
                value={profileData.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter your first name"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-xs">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter your last name"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="email" className="flex items-center gap-1 text-xs">
                <Mail className="w-3 h-3" />
                Email Address
              </Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted h-8 text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Email cannot be changed here
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone" className="flex items-center gap-1 text-xs">
                <Phone className="w-3 h-3" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={profileData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="address" className="flex items-center gap-1 text-xs">
                <MapPin className="w-3 h-3" />
                Address
              </Label>
              <Textarea
                id="address"
                value={profileData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bio" className="text-xs">Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself"
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="company" className="text-xs">Company</Label>
                <Input
                  id="company"
                  value={profileData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Your company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profileData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={profileData.date_of_birth || ''}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;