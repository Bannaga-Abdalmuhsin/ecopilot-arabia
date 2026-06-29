import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Leaf } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import { useTranslation } from 'react-i18next';

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAuth = async (action: 'signin' | 'signup') => {
    setLoading(true);
    setError(null);
    const { error } = action === 'signin' 
      ? await signIn(email, password)
      : await signUp(email, password);
      
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-foreground text-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/30 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="z-10 w-full max-w-md p-4">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Taqah Advisor</h1>
          <p className="text-muted mt-2 text-center">Intelligence for Energy Efficiency.</p>
        </div>

        <Card className="border-primary/20 bg-background/95 backdrop-blur overflow-hidden">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border bg-muted/50 p-0 h-auto">
              <TabsTrigger value="signin" className="py-4 data-[state=active]:bg-background rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">{t('auth.signIn')}</TabsTrigger>
              <TabsTrigger value="signup" className="py-4 data-[state=active]:bg-background rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">{t('auth.signUp')}</TabsTrigger>
            </TabsList>
            
            <CardContent className="p-6">
              <Button 
                variant="outline" 
                type="button" 
                className="w-full mb-6" 
                onClick={() => signInWithGoogle()}
              >
                <SiGoogle className="mr-2 h-4 w-4" />
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

              <TabsContent value="signin" className="m-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">{t('auth.email')}</Label>
                  <Input 
                    id="email-signin" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
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
                  />
                </div>
                
                {error && <p className="text-sm text-destructive">{error}</p>}
                
                <Button 
                  className="w-full" 
                  onClick={() => handleAuth('signin')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t('auth.signIn')}
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="m-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">{t('auth.email')}</Label>
                  <Input 
                    id="email-signup" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">{t('auth.password')}</Label>
                  <Input 
                    id="password-signup" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                {error && <p className="text-sm text-destructive">{error}</p>}
                
                <Button 
                  className="w-full" 
                  onClick={() => handleAuth('signup')}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t('auth.signUp')}
                </Button>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
