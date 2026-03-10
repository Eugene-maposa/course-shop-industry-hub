import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Eye, Users, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const VisitorAnalytics = () => {
  const [period, setPeriod] = useState<string>("daily");

  const { data: stats, isLoading } = useQuery({
    queryKey: ['visitor-stats', period],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_visit_stats', { period });
      if (error) throw error;
      return (data || []).reverse() as { period_label: string; visit_count: number; unique_visitors: number }[];
    },
    refetchInterval: 30000
  });

  // Get today's, this week's, and this month's totals
  const { data: summary } = useQuery({
    queryKey: ['visitor-summary'],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [daily, weekly, monthly] = await Promise.all([
        supabase.from('site_visits').select('visitor_id', { count: 'exact' }).gte('visited_at', todayStart),
        supabase.from('site_visits').select('visitor_id', { count: 'exact' }).gte('visited_at', weekStart),
        supabase.from('site_visits').select('visitor_id', { count: 'exact' }).gte('visited_at', monthStart),
      ]);

      return {
        today: daily.count || 0,
        thisWeek: weekly.count || 0,
        thisMonth: monthly.count || 0,
      };
    },
    refetchInterval: 30000
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Visitor Analytics
        </h2>
        <p className="text-slate-400 text-sm">Track system visits daily, weekly, and monthly</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Today</p>
                <p className="text-2xl font-bold text-white">{summary?.today || 0}</p>
                <p className="text-slate-500 text-xs">visits</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">This Week</p>
                <p className="text-2xl font-bold text-white">{summary?.thisWeek || 0}</p>
                <p className="text-slate-500 text-xs">visits</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">This Month</p>
                <p className="text-2xl font-bold text-white">{summary?.thisMonth || 0}</p>
                <p className="text-slate-500 text-xs">visits</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm">Visit Trends</CardTitle>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList className="bg-slate-700 h-8">
                <TabsTrigger value="daily" className="text-xs px-3 h-6 data-[state=active]:bg-slate-600">Daily</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs px-3 h-6 data-[state=active]:bg-slate-600">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs px-3 h-6 data-[state=active]:bg-slate-600">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : stats && stats.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period_label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="visit_count" name="Total Visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unique_visitors" name="Unique Visitors" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              No visit data yet. Visits will be recorded as users browse the system.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
