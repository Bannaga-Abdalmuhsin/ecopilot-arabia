import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import { Navbar } from '@/components/layout/Navbar';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import History from '@/pages/History';
import Auth from '@/pages/Auth';

import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@/i18n/index';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

// Wire Supabase session token into every API request automatically
setAuthTokenGetter(() =>
  supabase.auth.getSession().then((r) => r.data.session?.access_token ?? null)
);

// Sync document dir/lang with the selected language — runs globally,
// including on /auth where the Navbar (which has its own effect) is hidden.
function LanguageDirectionSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  return null;
}

const queryClient = new QueryClient();

// Redirect unauthenticated users to /auth; show spinner while session loads
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <>{children}</>;
}

// Redirect already-authenticated users away from /auth
function AuthRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <Auth />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthRoute} />
      <Route path="/">
        {() => <ProtectedRoute><Home /></ProtectedRoute>}
      </Route>
      <Route path="/dashboard/:id">
        {() => <ProtectedRoute><Dashboard /></ProtectedRoute>}
      </Route>
      <Route path="/history">
        {() => <ProtectedRoute><History /></ProtectedRoute>}
      </Route>
      <Route>
        {() => <ProtectedRoute><NotFound /></ProtectedRoute>}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <LanguageDirectionSync />
              <div className="min-h-[100dvh] flex flex-col bg-background">
                {/* Navbar always visible — adapts based on auth state */}
                <Navbar />
                <main className="flex-1 flex flex-col relative">
                  <Router />
                </main>
              </div>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export default App;
