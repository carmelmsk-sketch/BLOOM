import { Switch, Route, Router as WouterRouter, useLocation } from 'wouter';
import { AppShell } from '@/layouts/app-shell';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider } from '@/hooks/use-auth';

import AuthPage from '@/pages/auth';
import DashboardPage from '@/pages/dashboard';
import ShopPage from '@/pages/shop';
import ShopPublicPage from '@/pages/shop-public';
import ProductPage from '@/pages/product';
import NotificationsPage from '@/pages/notifications';
import AdminPage from '@/pages/admin';
import HomePage from '@/pages/home';
import DiscoverPage from '@/pages/discover';
import CreatePage from '@/pages/create';
import CoachPage from '@/pages/coach';
import ProfilePage from '@/pages/profile';
import ActivityPage from '@/pages/activity';
import AcademyPage from '@/pages/academy';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import OnboardingPage from '@/pages/onboarding';
import NotFound from '@/pages/not-found';

function RoutedErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <ErrorBoundary resetKey={location}>
      {children}
    </ErrorBoundary>
  );
}

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const user = localStorage.getItem('bloom_user');

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return <Component />;
}

function AppRouter() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/shop/:slug" component={ShopPublicPage} />

        <AppShell>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/discover" component={DiscoverPage} />

            <Route path="/onboarding">
              <ProtectedRoute component={OnboardingPage} />
            </Route>

            <Route path="/create">
              <ProtectedRoute component={CreatePage} />
            </Route>

            <Route path="/coach">
              <ProtectedRoute component={CoachPage} />
            </Route>

            <Route path="/profile">
              <ProtectedRoute component={ProfilePage} />
            </Route>

            <Route path="/activity">
              <ProtectedRoute component={ActivityPage} />
            </Route>

            <Route path="/academy" component={AcademyPage} />

            <Route path="/dashboard">
              <ProtectedRoute component={DashboardPage} />
            </Route>

            <Route path="/shop">
              <ProtectedRoute component={ShopPage} />
            </Route>

            <Route path="/product/:slug" component={ProductPage} />

            <Route path="/notifications">
              <ProtectedRoute component={NotificationsPage} />
            </Route>

            <Route path="/admin">
              <ProtectedRoute component={AdminPage} />
            </Route>

            <Route component={NotFound} />
          </Switch>
        </AppShell>
      </Switch>
    </RoutedErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WouterRouter>
        <AppRouter />
      </WouterRouter>
    </AuthProvider>
  );
}
