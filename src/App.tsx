
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useTheme } from "@/hooks/useTheme";
import { useVisitTracker } from "@/hooks/useVisitTracker";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Shops from "./pages/Shops";
import Industries from "./pages/Industries";
import ProductDetail from "./pages/ProductDetail";
import Help from "./pages/Help";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import UserDashboard from "./pages/UserDashboard";
import MinistryDashboard from "./pages/MinistryDashboard";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useVisitTracker();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<Products />} />
      <Route path="/shops" element={<Shops />} />
      <Route path="/industries" element={<Industries />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/help" element={<Help />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/site-ops/login" element={<AdminLogin />} />
      <Route path="/site-ops" element={<AdminPanel />} />
      <Route path="/site-ops/ministry" element={<MinistryDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppContent = () => {
  useTheme();
  
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
