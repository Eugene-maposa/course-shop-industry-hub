import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bell, FileText, Building2, Package, Settings, ArrowLeft, Home } from 'lucide-react';
import UserProfile from '@/components/dashboard/UserProfile';
import UserNotifications from '@/components/dashboard/UserNotifications';
import UserDocuments from '@/components/dashboard/UserDocuments';
import UserShops from '@/components/dashboard/UserShops';
import UserProducts from '@/components/dashboard/UserProducts';
import UserSettings from '@/components/dashboard/UserSettings';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access your dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">User Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.email}. Manage your profile, notifications, and business information.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2">
            <TabsTrigger value="profile" className="flex items-center gap-2 min-w-fit">
              <User className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 relative min-w-fit">
              <Bell className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2 min-w-fit">
              <FileText className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="shops" className="flex items-center gap-2 min-w-fit">
              <Building2 className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Shops</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 min-w-fit">
              <Package className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Products</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 min-w-fit">
              <Settings className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <UserProfile />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <UserNotifications />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <UserDocuments />
          </TabsContent>

          <TabsContent value="shops" className="space-y-6">
            <UserShops />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <UserProducts />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <UserSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;