import { Link, useLocation } from "wouter"
import { Building2, History, LogOut, Globe, LogIn } from "lucide-react"
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="EcoPilot Arabia"
            className="h-12 w-auto object-contain rounded-lg"
          />
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4 md:space-x-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${location === "/" ? "text-primary" : "text-muted-foreground"}`}
          >
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              <span className="hidden md:inline-block">{t('nav.newAssessment')}</span>
            </div>
          </Link>
          {user && (
            <Link 
              href="/history" 
              className={`text-sm font-medium transition-colors hover:text-primary ${location === "/history" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div className="flex items-center gap-1.5">
                <History className="h-4 w-4" />
                <span className="hidden md:inline-block">{t('nav.history')}</span>
              </div>
            </Link>
          )}
          
          <div className="h-4 w-px bg-border hidden sm:block" />
          
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2 px-2 text-muted-foreground hover:text-foreground">
            <Globe className="h-4 w-4" />
            <span className="font-semibold text-xs">{t('nav.language')}</span>
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden lg:inline-block max-w-[120px] truncate" dir="ltr">
                {user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive" title={t('nav.signOut')}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline-block font-medium text-sm">{t('nav.signIn')}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
