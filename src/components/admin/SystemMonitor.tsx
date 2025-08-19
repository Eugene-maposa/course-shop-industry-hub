import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Database, Server, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

export const SystemMonitor = () => {
  const [systemHealth, setSystemHealth] = useState("healthy");

  // Fetch system metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const [
        dbStats,
        userActivity,
        errorLogs,
        storageUsage
      ] = await Promise.all([
        supabase.rpc('get_user_count'),
        supabase.from('admin_audit_log').select('*', { count: 'exact', head: true }),
        supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.storage.getBucket('product-images')
      ]);

      return {
        totalUsers: dbStats.data || 0,
        totalAuditLogs: userActivity.count || 0,
        recentLogs: errorLogs.data || [],
        storageHealth: storageUsage.error ? 'error' : 'healthy'
      };
    },
    refetchInterval: 15000 // Refresh every 15 seconds for better monitoring
  });

  // Real-time system health monitoring
  useEffect(() => {
    const checkSystemHealth = () => {
      if (metrics) {
        const isHealthy = metrics.storageHealth === 'healthy' && 
                         metrics.totalUsers > 0;
        setSystemHealth(isHealthy ? 'healthy' : 'warning');
      }
    };

    checkSystemHealth();
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-600 rounded mb-2"></div>
                <div className="h-8 bg-slate-600 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">System Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {systemHealth === 'healthy' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  )}
                  <span className="text-white font-semibold">
                    {systemHealth === 'healthy' ? 'Healthy' : 'Warning'}
                  </span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Database</p>
                <p className="text-2xl font-bold text-white">{metrics?.totalUsers}</p>
                <p className="text-slate-400 text-xs">Total Users</p>
              </div>
              <Database className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Activity Logs</p>
                <p className="text-2xl font-bold text-white">{metrics?.totalAuditLogs}</p>
                <p className="text-slate-400 text-xs">Total Actions</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Storage</p>
                <Badge className={metrics?.storageHealth === 'healthy' ? 'bg-green-500' : 'bg-red-500'}>
                  {metrics?.storageHealth === 'healthy' ? 'Online' : 'Error'}
                </Badge>
              </div>
              <Server className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent System Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics?.recentLogs?.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">{log.action}</p>
                  <p className="text-slate-400 text-sm">
                    {log.target_table && `Table: ${log.target_table}`}
                  </p>
                </div>
                <Badge variant="outline" className="text-slate-300">
                  {new Date(log.created_at).toLocaleTimeString()}
                </Badge>
              </div>
            )) || (
              <p className="text-slate-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};