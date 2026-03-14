import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit3, X, Upload, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductImageEditorProps {
  productId: string;
  mainImage: string;
  galleryImages: string[];
  onEditComplete?: () => void;
}

const ProductImageEditor = ({ 
  productId, 
  mainImage, 
  galleryImages, 
  onEditComplete 
}: ProductImageEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editedMainImage, setEditedMainImage] = useState(mainImage);
  const [editedGalleryImages, setEditedGalleryImages] = useState<string[]>(galleryImages);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: async (data: { mainImage: string; galleryImages: string[] }) => {
      const { error } = await supabase
        .from('products')
        .update({
          main_image_url: data.mainImage,
          gallery_images: data.galleryImages
        })
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast({
        title: "Success",
        description: "Product images updated successfully!"
      });
      setIsEditing(false);
      onEditComplete?.();
    },
    onError: (error) => {
      console.error('Error updating product images:', error);
      toast({
        title: "Error",
        description: "Failed to update product images. Please try again.",
        variant: "destructive"
      });
    }
  });

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
      setEditedMainImage(url);
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
      setEditedGalleryImages([...editedGalleryImages, ...successfulUrls]);
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
    const newGalleryImages = editedGalleryImages.filter((_, index) => index !== indexToRemove);
    setEditedGalleryImages(newGalleryImages);
  };

  const handleSave = () => {
    updateProductMutation.mutate({
      mainImage: editedMainImage,
      galleryImages: editedGalleryImages
    });
  };

  const handleCancel = () => {
    setEditedMainImage(mainImage);
    setEditedGalleryImages(galleryImages);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm"
      >
        <Edit3 className="w-4 h-4 mr-2" />
        Edit Images
      </Button>
    );
  }

  return (
    <Card className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Product Images</h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateProductMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={updateProductMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Main Image Editor */}
        <div className="space-y-4">
          <h4 className="font-medium">Main Image</h4>
          <div className="relative">
            <div className="aspect-square bg-white rounded-lg overflow-hidden border-2 border-dashed border-border">
              <img 
                src={editedMainImage} 
                alt="Main product"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-2 right-2 space-x-2">
              <label htmlFor="main-image-upload">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={uploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Replace
                  </span>
                </Button>
              </label>
              <Input
                id="main-image-upload"
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        {/* Gallery Images Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Gallery Images</h4>
            <label htmlFor="gallery-images-upload">
              <Button
                size="sm"
                variant="outline"
                disabled={uploading}
                asChild
              >
                <span className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Add More
                </span>
              </Button>
            </label>
            <Input
              id="gallery-images-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {editedGalleryImages.map((image, index) => (
              <div key={index} className="relative">
                <div className="aspect-square bg-white rounded-lg overflow-hidden border">
                  <img 
                    src={image} 
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
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
        </div>

        {uploading && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Uploading images...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductImageEditor;