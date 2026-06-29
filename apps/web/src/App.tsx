import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { DashboardPage } from "@/pages/Dashboard";
import { AssetsPage } from "@/pages/Assets";
import { AssetDetailPage } from "@/pages/Assets/AssetDetail";
import { EventsPage } from "@/pages/Events";
import { AlertsPage } from "@/pages/Alerts";
import { HoneytokensPage } from "@/pages/Honeytokens";
import { SettingsPage } from "@/pages/Settings";
import { AuditPage } from "@/pages/Audit";
import { LoadingSpinner } from "@/components/ui";

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 10000 } } });

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/:assetId" element={<AssetDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/honeytokens" element={<HoneytokensPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
// Project version: DeceptionGrid V1.1
