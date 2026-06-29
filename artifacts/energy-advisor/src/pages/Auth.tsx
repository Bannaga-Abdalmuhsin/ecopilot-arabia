import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MailCheck, AlertCircle, Zap, Leaf, Brain } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import { useTranslation } from 'react-i18next';

// Feature labels resolved via t() inside component

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const features = [
    { icon: Brain, text: t('auth.features.aiAnalysis') },
    { icon: Zap, text: t('auth.features.energyScore') },
    { icon: Leaf, text: t('auth.features.carbonReport') },
  ];

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error.message ?? 'Could not start Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      if (error.message?.includes('Invalid login credentials')) setError('Incorrect email or password. Please check and try again.');
      else if (error.message?.includes('Email not confirmed')) setError('Please confirm your email before signing in. Check your inbox.');
      else setError(error.message ?? 'Sign-in failed. Please try again.');
    } else { setLocation('/'); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError(null);
    const { data, error } = await signUp(email, password) as any;
    setLoading(false);
    if (error) {
      if (error.message?.includes('already registered') || error.message?.includes('already been registered'))
        setError('An account with this email already exists. Try signing in instead.');
      else setError(error.message ?? 'Sign-up failed. Please try again.');
      return;
    }
    if (!data?.session) setAwaitingConfirmation(true);
    else setLocation('/');
  };

  if (awaitingConfirmation) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 hero-gradient pattern-bg">
        <div className="glass-card p-10 max-w-sm w-full text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#006C35]/10 border border-[#006C35]/20 flex items-center justify-center mx-auto mb-5">
            <MailCheck className="h-8 w-8 text-[#006C35]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">{t('auth.checkEmail')}</h2>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
            {t('auth.checkEmailDesc', { email })}
          </p>
          <Button
            className="w-full rounded-xl border-[#006C35]/20 text-[#006C35] hover:bg-[#006C35]/5 font-semibold"
            variant="outline"
            onClick={() => { setAwaitingConfirmation(false); setPassword(''); }}
          >
            {t('auth.backToSignIn')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-stretch overflow-hidden">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-1/2 hero-gradient pattern-bg flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 glow-gold opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 glow-green opacity-40 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          <img src="/logo-icon.png" alt="EcoPilot Arabia" className="h-24 w-24 object-contain mb-6 drop-shadow-2xl" />
          <h1 className="text-3xl font-extrabold text-white mb-3 leading-tight">
            EcoPilot <span className="text-[#E8C874]">Arabia</span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed mb-10">
            {t('auth.brandSubtitle')}
          </p>
          <div className="space-y-3 w-full">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                <div className="h-7 w-7 rounded-lg bg-[#C89B3C]/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-[#E8C874]" />
                </div>
                <span className="text-white/90 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-[#F8FAF9] p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src="/logo-icon.png" alt="EcoPilot Arabia" className="h-16 w-16 object-contain mb-3" />
            <h1 className="text-2xl font-extrabold text-[#1F2937]">
              EcoPilot <span className="text-[#C89B3C]">Arabia</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1F2937]">{t('auth.welcomeBack')}</h2>
            <p className="text-[#6B7280] text-sm mt-1">{t('auth.welcomeSubtitle')}</p>
          </div>

          <div className="glass-card overflow-hidden">
            <Tabs defaultValue="signin" className="w-full" onValueChange={() => setError(null)}>
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-[#006C35]/8 bg-[#F8FAF9]/50 p-0 h-auto">
                <TabsTrigger
                  value="signin"
                  className="py-3.5 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#006C35] font-semibold text-sm data-[state=active]:text-[#006C35] text-[#6B7280]"
                >
                  {t('auth.signIn')}
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="py-3.5 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#006C35] font-semibold text-sm data-[state=active]:text-[#006C35] text-[#6B7280]"
                >
                  {t('auth.signUp')}
                </TabsTrigger>
              </TabsList>

              <div className="p-7">
                {/* Google */}
                <Button
                  variant="outline" type="button"
                  className="w-full mb-5 rounded-xl border-[#006C35]/15 hover:border-[#006C35]/30 hover:bg-[#006C35]/3 font-semibold gap-2 h-11"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                >
                  {googleLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <SiGoogle className="h-4 w-4 text-red-500" />}
                  {t('auth.continueWithGoogle')}
                </Button>

                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#006C35]/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-[#6B7280] font-medium">{t('auth.orContinueWith')}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                <TabsContent value="signin" className="m-0">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email-signin" className="text-sm font-semibold text-[#1F2937]">{t('auth.email')}</Label>
                      <Input id="email-signin" type="email" placeholder="name@example.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} dir="ltr" autoComplete="email" required
                        className="rounded-xl border-[#006C35]/15 focus-visible:ring-[#006C35]/20 h-11 bg-[#F8FAF9]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password-signin" className="text-sm font-semibold text-[#1F2937]">{t('auth.password')}</Label>
                      <Input id="password-signin" type="password" value={password}
                        onChange={(e) => setPassword(e.target.value)} dir="ltr" autoComplete="current-password" required
                        className="rounded-xl border-[#006C35]/15 focus-visible:ring-[#006C35]/20 h-11 bg-[#F8FAF9]" />
                    </div>
                    <Button type="submit" className="w-full btn-premium h-11 font-semibold mt-2" disabled={loading || googleLoading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.signIn')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="m-0">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email-signup" className="text-sm font-semibold text-[#1F2937]">{t('auth.email')}</Label>
                      <Input id="email-signup" type="email" placeholder="name@example.com" value={email}
                        onChange={(e) => setEmail(e.target.value)} dir="ltr" autoComplete="email" required
                        className="rounded-xl border-[#006C35]/15 focus-visible:ring-[#006C35]/20 h-11 bg-[#F8FAF9]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password-signup" className="text-sm font-semibold text-[#1F2937]">{t('auth.password')}</Label>
                      <Input id="password-signup" type="password" placeholder="Min. 6 characters" value={password}
                        onChange={(e) => setPassword(e.target.value)} dir="ltr" autoComplete="new-password" required minLength={6}
                        className="rounded-xl border-[#006C35]/15 focus-visible:ring-[#006C35]/20 h-11 bg-[#F8FAF9]" />
                    </div>
                    <Button type="submit" className="w-full btn-premium h-11 font-semibold mt-2" disabled={loading || googleLoading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.signUp')}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <p className="text-center text-xs text-[#6B7280] mt-6">
            {t('auth.termsNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
