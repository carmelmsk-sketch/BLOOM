import { type ReactNode } from 'react';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AppShell } from '@/layouts/app-shell';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/components/auth-guard';
import AuthPage from '@/pages/auth';
import OnboardingPage from '@/pages/onboarding';
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
import NotFound from '@/pages/not-found';

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/auth" component={AuthPage} />
    <Route path="/shop/:slug" component={ShopPublicPage} />
    <Route>
      <AppShell><Switch>
        <Route path="/" component={HomePage} />
        <Route path="/discover" component={DiscoverPage} />
        <Route path="/onboarding"><ProtectedRoute onboarding={false}><OnboardingPage /></ProtectedRoute></Route>
        <Route path="/create"><ProtectedRoute><CreatePage /></ProtectedRoute></Route>
        <Route path="/coach"><ProtectedRoute><CoachPage /></ProtectedRoute></Route>
        <Route path="/profile"><ProtectedRoute><ProfilePage /></ProtectedRoute></Route>
        <Route path="/dashboard"><ProtectedRoute><DashboardPage /></ProtectedRoute></Route>
        <Route path="/shop"><ProtectedRoute><ShopPage /></ProtectedRoute></Route>
        <Route path="/product/:slug" component={ProductPage} />
        <Route path="/activity"><ProtectedRoute><ActivityPage /></ProtectedRoute></Route>
        <Route path="/notifications"><ProtectedRoute><NotificationsPage /></ProtectedRoute></Route>
        <Route path="/academy" component={AcademyPage} />
        <Route path="/admin"><ProtectedRoute><AdminPage /></ProtectedRoute></Route>
        <Route component={NotFound} />
      </Switch></AppShell>
    </Route>
  </Switch></RoutedErrorBoundary>;
}

function App() {
  return <AuthProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter></AuthProvider>;
}

export default App;