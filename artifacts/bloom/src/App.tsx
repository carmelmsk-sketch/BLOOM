import type { ComponentType, ReactNode } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { AppShell } from "@/layouts/app-shell";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import HomePage from "@/pages/home";
import DiscoverPage from "@/pages/discover";
import OnboardingPage from "@/pages/onboarding";
import CreatePage from "@/pages/create";
import CoachPage from "@/pages/coach";
import ProfilePage from "@/pages/profile";
import ActivityPage from "@/pages/activity";
import AcademyPage from "@/pages/academy";
import DashboardPage from "@/pages/dashboard";
import ShopPage from "@/pages/shop";
import ProductPage from "@/pages/product";
import NotificationsPage from "@/pages/notifications";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ShopPublicPage from "@/pages/shop-public";
import NotFound from "@/pages/not-found";

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function AppRouter() {
  return (
    <WouterRouter>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/shop/:slug" component={ShopPublicPage} />

          <AppShell>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/discover" component={DiscoverPage} />
              <Route path="/onboarding" component={OnboardingPage} />
              <Route path="/create" component={CreatePage} />
              <Route path="/coach" component={CoachPage} />

              <Route
                path="/profile"
                component={() => (
                  <ProtectedRoute component={ProfilePage} />
                )}
              />

              <Route
                path="/activity"
                component={() => (
                  <ProtectedRoute component={ActivityPage} />
                )}
              />

              <Route
                path="/academy"
                component={() => (
                  <ProtectedRoute component={AcademyPage} />
                )}
              />

              <Route
                path="/dashboard"
                component={() => (
                  <ProtectedRoute component={DashboardPage} />
                )}
              />

              <Route
                path="/shop"
                component={() => (
                  <ProtectedRoute component={ShopPage} />
                )}
              />

              <Route path="/product/:slug" component={ProductPage} />

              <Route
                path="/notifications"
                component={() => (
                  <ProtectedRoute component={NotificationsPage} />
                )}
              />

              <Route
                path="/admin"
                component={() => (
                  <ProtectedRoute component={AdminPage} />
                )}
              />

              <Route component={NotFound} />
            </Switch>
          </AppShell>
        </Switch>
      </RoutedErrorBoundary>
    </WouterRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
