import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MailCheck, AlertCircle } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import { useTranslation } from 'react-i18next';

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When Supabase requires email confirmation, show a success state instead of error
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    // signInWithGoogle redirects the browser if successful — error means it couldn't start
    if (result?.error) {
      setError(result.error.message ?? 'Could not start Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
    // Don't setGoogleLoading(false) on success — page is navigating away
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      // Give a clearer message for the generic Supabase failure
      if (error.message?.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please check and try again.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Please confirm your email before signing in. Check your inbox.');
      } else {
        setError(error.message ?? 'Sign-in failed. Please try again.');
      }
    } else {
      setLocation('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await signUp(email, password) as any;
    setLoading(false);

    if (error) {
      if (error.message?.includes('already registered') || error.message?.includes('already been registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(error.message ?? 'Sign-up failed. Please try again.');
      }
      return;
    }

    // If session is null after sign-up, Supabase requires email confirmation
    if (!data?.session) {
      setAwaitingConfirmation(true);
    } else {
      setLocation('/');
    }
  };

  // Email confirmation pending state
  if (awaitingConfirmation) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-foreground text-background">
        <div className="max-w-sm text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
          <p className="text-muted text-sm leading-relaxed">
            We sent a confirmation link to <span className="font-semibold text-foreground" dir="ltr">{email}</span>.
            Click the link to activate your account, then come back and sign in.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setAwaitingConfirmation(false);
              setPassword('');
            }}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-foreground text-background relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/30 blur-[100px] rounded-full pointer-events-none" />

      <div className="z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="EcoPilot Arabia"
            className="h-28 w-auto object-contain mb-2 drop-shadow-xl"
          />
          <h1 className="sr-only">EcoPilot Arabia</h1>
          <p className="text-muted mt-1 text-center text-sm">Intelligence for Energy Efficiency.</p>
        </div>

        <Card className="border-primary/20 bg-background/95 backdrop-blur overflow-hidden">
          <Tabs defaultValue="signin" className="w-full" onValueChange={() => setError(null)}>
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border bg-muted/50 p-0 h-auto">
              <TabsTrigger
                value="signin"
                className="py-4 data-[state=active]:bg-background rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {t('auth.signIn')}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="py-4 data-[state=active]:bg-background rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {t('auth.signUp')}
              </TabsTrigger>
            </TabsList>

            <CardContent className="p-6">
              {/* Google button — shared across both tabs */}
              <Button
                variant="outline"
                type="button"
                className="w-full mb-6"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                {googleLoading
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <SiGoogle className="mr-2 h-4 w-4" />
                }
                {t('auth.continueWithGoogle')}
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('auth.orContinueWith')}
                  </span>
                </div>
              </div>

              {/* Shared error banner */}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sign In tab */}
              <TabsContent value="signin" className="m-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signin">{t('auth.email')}</Label>
                    <Input
                      id="email-signin"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      dir="ltr"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signin">{t('auth.password')}</Label>
                    <Input
                      id="password-signin"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="ltr"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.signIn')}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up tab */}
              <TabsContent value="signup" className="m-0">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">{t('auth.email')}</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      dir="ltr"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">{t('auth.password')}</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="ltr"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('auth.signUp')}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
