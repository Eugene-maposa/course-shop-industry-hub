
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Package, Store, Building2, User, LogOut, Shield, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeModeToggle from "./ThemeModeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import NotificationCenter from "./NotificationCenter";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const navigation = [
    { name: "Products", href: "/products", icon: Package },
    { name: "Shops", href: "/shops", icon: Store },
    { name: "Industries", href: "/industries", icon: Building2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
    }
  };

  return (
    <nav className="bg-nust-blue border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-nust-blue" />
              </div>
              <span className="text-xl font-bold text-white">
                IndustryHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-nust-blue-light text-white"
                  : "text-gray-200 hover:text-white hover:bg-nust-blue-light"
              }`}
            >
              Home
            </Link>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-nust-blue-light text-white"
                      : "text-gray-200 hover:text-white hover:bg-nust-blue-light"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <Link to="/help" className="text-gray-200 hover:text-white hover:bg-nust-blue-light px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Help ?
            </Link>
            
            <ThemeModeToggle />
            
            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/dashboard' || location.pathname.startsWith('/site-ops')
                          ? "bg-nust-blue-light text-white hover:bg-nust-blue-light hover:text-white"
                          : "text-gray-200 hover:text-white hover:bg-nust-blue-light"
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Dashboard</span>
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50 bg-popover">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/site-ops" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="w-4 h-4" />
                          <span>Site Ops</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center space-x-2 text-gray-200">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white hover:text-nust-blue"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-200 hover:text-white hover:bg-nust-blue-light"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-nust-blue-dark rounded-lg mt-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === "/"
                    ? "bg-nust-blue-light text-white"
                    : "text-gray-200 hover:text-white hover:bg-nust-blue-light"
                }`}
              >
                Home
              </Link>
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-nust-blue-light text-white"
                        : "text-gray-200 hover:text-white hover:bg-nust-blue-light"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <Link
                to="/help"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-nust-blue-light transition-colors"
              >
                Help ?
              </Link>
              
              {/* Mobile User Menu */}
              {user && (
                <div className="border-t border-nust-blue-light pt-2 mt-2">
                  <div className="px-3 py-2 text-gray-200 text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location.pathname === '/dashboard'
                        ? "bg-nust-blue-light text-white"
                        : "text-gray-200 hover:text-white hover:bg-nust-blue-light"
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/site-ops"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        location.pathname.startsWith('/site-ops')
                          ? "bg-nust-blue-light text-white"
                          : "text-gray-200 hover:text-white hover:bg-nust-blue-light"
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      <span>Site Ops</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-nust-blue-light transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
