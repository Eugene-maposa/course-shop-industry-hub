
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
      toast({ title: "Success", description: "Industry registered successfully!" });
      setFormData({ name: "", description: "", code: "" });
      queryClient.invalidateQueries({ queryKey: ['industries'] });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to register industry. Please try again.", variant: "destructive" });
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
      <CardHeader className="text-center bg-primary text-primary-foreground py-4">
        <CardTitle className="text-lg">Register New Industry</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Industry Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required placeholder="Enter industry name" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs">Industry Code *</Label>
              <Input id="code" value={formData.code} onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())} required placeholder="Enter industry code" className="h-9 text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Enter industry description" rows={3} className="text-sm min-h-[70px]" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 h-9 text-sm" disabled={registerIndustryMutation.isPending}>
              {registerIndustryMutation.isPending ? "Registering..." : "Register Industry"}
            </Button>
            <Button type="button" variant="outline" className="flex-1 h-9 text-sm" onClick={() => setFormData({ name: "", description: "", code: "" })}>
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IndustryRegistrationForm;
