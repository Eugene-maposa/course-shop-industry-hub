import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductImageUploadProps {
  mainImage: string | null;
  galleryImages: string[];
  onMainImageChange: (url: string | null) => void;
  onGalleryImagesChange: (urls: string[]) => void;
}

const ProductImageUpload = ({
  mainImage,
  galleryImages,
  onMainImageChange,
  onGalleryImagesChange
}: ProductImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const url = await uploadImage(file);
    
    if (url) {
      onMainImageChange(url);
      toast({
        title: "Success",
        description: "Main image uploaded successfully!"
      });
    } else {
      toast({
        title: "Upload failed",
        description: "Failed to upload main image. Please try again.",
        variant: "destructive"
      });
    }
    setUploading(false);
  };

  const handleGalleryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: "Some files are larger than 5MB and will be skipped.",
        variant: "destructive"
      });
    }

    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length === 0) return;

    setUploading(true);
    const uploadPromises = validFiles.map(file => uploadImage(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    
    const successfulUrls = uploadedUrls.filter(url => url !== null) as string[];
    
    if (successfulUrls.length > 0) {
      onGalleryImagesChange([...galleryImages, ...successfulUrls]);
      toast({
        title: "Success",
        description: `${successfulUrls.length} gallery image(s) uploaded successfully!`
      });
    } else {
      toast({
        title: "Upload failed",
        description: "Failed to upload gallery images. Please try again.",
        variant: "destructive"
      });
    }
    setUploading(false);
  };

  const removeGalleryImage = (indexToRemove: number) => {
    const newGalleryImages = galleryImages.filter((_, index) => index !== indexToRemove);
    onGalleryImagesChange(newGalleryImages);
  };

  const removeMainImage = () => {
    onMainImageChange(null);
  };

  return (
    <div className="space-y-6">
      {/* Main Image Upload */}
      <div className="space-y-2">
        <Label>Main Product Image</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6">
          {mainImage ? (
            <div className="relative">
              <img
                src={mainImage}
                alt="Main product"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeMainImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <Label htmlFor="main-image" className="cursor-pointer">
                <div className="text-sm text-muted-foreground mb-2">
                  Click to upload main product image
                </div>
                <Button type="button" variant="outline" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Choose Image"}
                </Button>
              </Label>
              <Input
                id="main-image"
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Gallery Images Upload */}
      <div className="space-y-2">
        <Label>Gallery Images (Optional)</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeGalleryImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Label htmlFor="gallery-images" className="cursor-pointer">
              <div className="text-sm text-muted-foreground mb-2">
                Add more images to gallery
              </div>
              <Button type="button" variant="outline" disabled={uploading}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Add Images"}
              </Button>
            </Label>
            <Input
              id="gallery-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          You can upload multiple images. Maximum 5MB per image.
        </p>
      </div>
    </div>
  );
};

export default ProductImageUpload;