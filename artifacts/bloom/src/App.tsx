import { type ReactNode } from 'react';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AppShell } from '@/layouts/app-shell';
import { ErrorBoundary } from '@/components/error-boundary';
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

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ProtectedRoute({ path, component: Component }: { path: string; component: any }) {
  const [location] = useLocation();
  
  if (location === path) {
    const user = localStorage.getItem('bloom_user');
    if (!user) {
      window.location.href = '/login';
      return null;
    }
  }
  
  return <Route path={path} component={Component} />;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <AppShell>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/discover" component={DiscoverPage} />
            <Route path="/create" component={CreatePage} />
            <Route path="/coach" component={CoachPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/activity" component={ActivityPage} />
            <Route path="/academy" component={AcademyPage} />
            <Route component={NotFound} />
          </Switch>
        </AppShell>
      </Switch>
    </RoutedErrorBoundary>
  );
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>;
}

export default App;
