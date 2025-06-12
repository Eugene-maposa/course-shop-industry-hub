
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const IndustryRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerIndustryMutation = useMutation({
    mutationFn: async (industryData: typeof formData) => {
      const { data, error } = await supabase
        .from('industries')
        .insert(industryData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Industry registered successfully!"
      });
      setFormData({
        name: "",
        description: "",
        code: ""
      });
      queryClient.invalidateQueries({ queryKey: ['industries'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register industry. Please try again.",
        variant: "destructive"
      });
      console.error("Error registering industry:", error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerIndustryMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center bg-nust-blue text-white">
        <CardTitle className="text-2xl">Register New Industry</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Industry Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="Enter industry name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Industry Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                required
                placeholder="Enter industry code"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter industry description"
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-nust-blue hover:bg-nust-blue-dark"
              disabled={registerIndustryMutation.isPending}
            >
              {registerIndustryMutation.isPending ? "Registering..." : "Register Industry"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => setFormData({
                name: "",
                description: "",
                code: ""
              })}
            >
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IndustryRegistrationForm;
