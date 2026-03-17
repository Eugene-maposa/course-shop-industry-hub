
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Send, Trash2, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const StarRating = ({
  rating,
  onRate,
  interactive = false,
  size = 'md',
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => onRate?.(star)}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (hover || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews' as any)
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for reviewers
      const userIds = [...new Set((data as any[]).map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      return (data as any[]).map((review: any) => ({
        ...review,
        user_profile: profileMap.get(review.user_id) || null,
      })) as Review[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`reviews-${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_reviews',
          filter: `product_id=eq.${productId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, queryClient]);

  // Submit review
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      if (newRating === 0) throw new Error('Please select a rating');

      const { error } = await supabase.from('product_reviews' as any).insert({
        product_id: productId,
        user_id: user.id,
        rating: newRating,
        comment: newComment.trim() || null,
      } as any);

      if (error) {
        if (error.code === '23505') throw new Error('You have already reviewed this product');
        throw error;
      }
    },
    onSuccess: () => {
      setNewRating(0);
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast.success('Review submitted!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update review
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingId) return;
      const { error } = await supabase
        .from('product_reviews' as any)
        .update({ rating: editRating, comment: editComment.trim() || null } as any)
        .eq('id', editingId);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast.success('Review updated!');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete review
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('product_reviews' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast.success('Review deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Stats
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0] };
    const dist = [0, 0, 0, 0, 0];
    let sum = 0;
    reviews.forEach((r) => {
      sum += r.rating;
      dist[r.rating - 1]++;
    });
    return { avg: sum / reviews.length, total: reviews.length, dist };
  }, [reviews]);

  const userReview = reviews.find((r) => r.user_id === user?.id);
  const canReview = user && !userReview;

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const getDisplayName = (review: Review) => {
    const p = review.user_profile;
    if (p?.first_name || p?.last_name) {
      return `${p.first_name || ''} ${p.last_name || ''}`.trim();
    }
    return 'Anonymous User';
  };

  const getInitials = (review: Review) => {
    const name = getDisplayName(review);
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8">
      {/* Summary */}
      <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Average */}
            <div className="flex flex-col items-center justify-center min-w-[140px]">
              <div className="text-5xl font-bold text-foreground">
                {stats.avg > 0 ? stats.avg.toFixed(1) : '—'}
              </div>
              <StarRating rating={Math.round(stats.avg)} size="md" />
              <p className="text-sm text-muted-foreground mt-1">
                {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.dist[star - 1];
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm w-8 text-right">{star}★</span>
                    <Progress value={pct} className="h-2 flex-1" />
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review */}
      {canReview && (
        <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Write a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Your rating</p>
              <StarRating rating={newRating} onRate={setNewRating} interactive size="lg" />
            </div>
            <Textarea
              placeholder="Share your experience with this product..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={1000}
              rows={4}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{newComment.length}/1000</span>
              <Button
                onClick={() => submitMutation.mutate()}
                disabled={newRating === 0 || submitMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">Please sign in to leave a review.</p>
          </CardContent>
        </Card>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="pt-6">
                {editingId === review.id ? (
                  <div className="space-y-4">
                    <StarRating rating={editRating} onRate={setEditRating} interactive size="md" />
                    <Textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      maxLength={1000}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(review)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{getDisplayName(review)}</p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {user?.id === review.user_id && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(review)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteMutation.mutate(review.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground pl-[52px]">{review.comment}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
