import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePhotoUploadProps {
  currentAvatar?: string;
  initials: string;
  userId: string;
  onAvatarUpdate: (url: string) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentAvatar,
  initials,
  userId,
  onAvatarUpdate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update avatar URL in the parent component
      onAvatarUpdate(publicUrl);

      toast({
        title: 'Photo Uploaded',
        description: 'Your profile photo has been updated successfully.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAvatar = () => {
    onAvatarUpdate('');
    toast({
      title: 'Photo Removed',
      description: 'Your profile photo has been removed.',
    });
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={currentAvatar} />
          <AvatarFallback className="text-lg font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload Button */}
        <Button
          size="icon"
          variant="outline"
          className="absolute -bottom-2 -right-2 h-8 w-8"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </Button>

        {/* Remove Button (only show if there's an avatar) */}
        {currentAvatar && (
          <Button
            size="icon"
            variant="outline"
            className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={removeAvatar}
            disabled={uploading}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold">Profile Photo</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Upload a photo to personalize your profile
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Choose Photo'}
          </Button>
          {currentAvatar && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeAvatar}
              disabled={uploading}
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG or GIF. Max size 5MB.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePhotoUpload;