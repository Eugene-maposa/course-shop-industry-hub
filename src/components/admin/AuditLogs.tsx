import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Calendar, User, Database, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterTable, setFilterTable] = useState("all");

  // Fetch audit logs
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', filterAction, filterTable],
    queryFn: async () => {
      let query = supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterAction !== 'all') {
        query = query.ilike('action', `%${filterAction}%`);
      }

      if (filterTable !== 'all') {
        query = query.eq('target_table', filterTable);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filter logs based on search term
  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.target_table && log.target_table.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActionBadge = (action: string) => {
    if (action.includes('create') || action.includes('add')) {
      return <Badge className="bg-green-500 text-white">Create</Badge>;
    } else if (action.includes('update') || action.includes('edit') || action.includes('approve')) {
      return <Badge className="bg-blue-500 text-white">Update</Badge>;
    } else if (action.includes('delete') || action.includes('remove')) {
      return <Badge className="bg-red-500 text-white">Delete</Badge>;
    } else {
      return <Badge variant="secondary">Action</Badge>;
    }
  };

  const getTableBadge = (table: string) => {
    if (!table) return null;
    
    const colors = {
      'shops': 'bg-purple-500',
      'products': 'bg-green-500',
      'industries': 'bg-blue-500',
      'admin_users': 'bg-orange-500'
    };

    return (
      <Badge className={`${colors[table] || 'bg-gray-500'} text-white`}>
        {table}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FileText className="w-6 h-6" />
          <span>Audit Logs</span>
        </h2>
        <p className="text-slate-400">Track all administrative actions and system changes</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 text-sm mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search actions, tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="text-slate-300 text-sm mb-2 block">Action Type</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-2 block">Table</label>
              <Select value={filterTable} onValueChange={setFilterTable}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Tables</SelectItem>
                  <SelectItem value="shops">Shops</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="industries">Industries</SelectItem>
                  <SelectItem value="admin_users">Admin Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity ({filteredLogs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Timestamp</TableHead>
                    <TableHead className="text-slate-300">Admin</TableHead>
                    <TableHead className="text-slate-300">Action</TableHead>
                    <TableHead className="text-slate-300">Table</TableHead>
                    <TableHead className="text-slate-300">Target ID</TableHead>
                    <TableHead className="text-slate-300">Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const timestamp = formatTimestamp(log.created_at);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-sm">{timestamp.date}</div>
                              <div className="text-xs text-slate-400">{timestamp.time}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{log.admin_user_id?.slice(0, 8)}...</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {getActionBadge(log.action)}
                            <span className="text-sm text-slate-300">{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Database className="w-4 h-4 text-slate-400" />
                            {getTableBadge(log.target_table)}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {log.target_id ? (
                            <code className="text-xs bg-slate-700 px-2 py-1 rounded">
                              {log.target_id.slice(0, 8)}...
                            </code>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {log.old_values || log.new_values ? (
                            <div className="text-xs">
                              {log.old_values && (
                                <div className="text-red-400">
                                  Old: {JSON.stringify(log.old_values).slice(0, 50)}...
                                </div>
                              )}
                              {log.new_values && (
                                <div className="text-green-400">
                                  New: {JSON.stringify(log.new_values).slice(0, 50)}...
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500">No changes recorded</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};