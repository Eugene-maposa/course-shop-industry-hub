import { useToast } from '@/hooks/use-toast';

interface ShareData {
  title: string;
  text?: string;
  url: string;
}

export const useShare = () => {
  const { toast } = useToast();

  const shareProduct = async (data: ShareData) => {
    // Check if native Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share(data);
        toast({
          title: "Shared successfully",
          description: "Product has been shared",
        });
      } catch (error) {
        // User cancelled sharing or other error
        if (error instanceof Error && error.name !== 'AbortError') {
          fallbackToClipboard(data.url);
        }
      }
    } else {
      // Fallback to copying to clipboard
      fallbackToClipboard(data.url);
    }
  };

  const fallbackToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Unable to share",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return { shareProduct };
};