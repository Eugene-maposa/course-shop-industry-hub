
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Package, Store, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Products", href: "/products", icon: Package },
    { name: "Shops", href: "/shops", icon: Store },
    { name: "Industries", href: "/industries", icon: Building2 },
  ];

  const isActive = (path: string) => location.pathname === path;

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
                ProductHub
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
