import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { OAuthProvider } from "@/contexts/OAuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterKids from "./pages/RegisterKids";
import RegisterBusiness from "./pages/RegisterBusiness";
import Dashboard from "./pages/Dashboard";
import PersonalInfo from "./pages/PersonalInfo";
import Security from "./pages/Security";
import Devices from "./pages/Devices";
import PasswordManager from "./pages/PasswordManager";
import Payments from "./pages/Payments";
import ConnectedApps from "./pages/ConnectedApps";
import DeveloperAccess from "./pages/DeveloperAccess";
import PeopleSharing from "./pages/PeopleSharing";
import DataPrivacy from "./pages/DataPrivacy";
import RecoveryCenter from "./pages/RecoveryCenter";
import BusinessAdmin from "./pages/BusinessAdmin";
import AccountChooser from "./pages/AccountChooser";
import OAuthConsent from "./pages/OAuthConsent";
import OAuthCallback from "./pages/OAuthCallback";
import CompanySettings from "./pages/CompanySettings";
import AdvancedProtection from "./pages/AdvancedProtection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to redirect authenticated users away from auth pages
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function LegacyRedirect({ to }: { to: string }) {
  // Preserve query params for OAuth and deep links
  const search = typeof window !== "undefined" ? window.location.search : "";
  return <Navigate to={`${to}${search}`} replace />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={
      <AuthRedirect>
        <Login />
      </AuthRedirect>
    } />
    <Route path="/register" element={
      <AuthRedirect>
        <Register />
      </AuthRedirect>
    } />
    <Route path="/register/kids" element={<RegisterKids />} />
    <Route path="/register/business" element={<RegisterBusiness />} />
    
    {/* OAuth Flow Routes */}
    <Route path="/v1/signin/accountchooser" element={<AccountChooser />} />
    <Route path="/accountchooser" element={<AccountChooser />} />

    {/* Legacy aliases (external ecosystem links) */}
    <Route path="/authorize" element={<LegacyRedirect to="/oauth/authorize" />} />

    {/* Canonical OAuth routes */}
    <Route path="/oauth/callback" element={<OAuthCallback />} />
    <Route path="/oauth/authorize" element={<OAuthConsent />} />
    <Route path="/oauth/consent" element={<OAuthConsent />} />
    
    {/* Dashboard Routes */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/personal" element={
      <ProtectedRoute>
        <PersonalInfo />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/security" element={
      <ProtectedRoute>
        <Security />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/devices" element={
      <ProtectedRoute>
        <Devices />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/passwords" element={
      <ProtectedRoute>
        <PasswordManager />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/payments" element={
      <ProtectedRoute>
        <Payments />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/apps" element={
      <ProtectedRoute>
        <ConnectedApps />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/privacy" element={
      <ProtectedRoute>
        <DataPrivacy />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/people" element={
      <ProtectedRoute>
        <PeopleSharing />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/developer" element={
      <ProtectedRoute>
        <DeveloperAccess />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/recovery" element={
      <ProtectedRoute>
        <RecoveryCenter />
      </ProtectedRoute>
    } />
    
    {/* Business Admin Console */}
    <Route path="/business" element={
      <ProtectedRoute>
        <BusinessAdmin />
      </ProtectedRoute>
    } />
    <Route path="/business/admin" element={
      <ProtectedRoute>
        <BusinessAdmin />
      </ProtectedRoute>
    } />
    <Route path="/business/settings" element={
      <ProtectedRoute>
        <CompanySettings />
      </ProtectedRoute>
    } />
    <Route path="/dashboard/advanced-protection" element={
      <ProtectedRoute>
        <AdvancedProtection />
      </ProtectedRoute>
    } />
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <OAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </OAuthProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
