import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Globe, LogIn, History, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

function getInitial(email?: string | null) {
  return email ? email[0].toUpperCase() : "U";
}

export function Navbar() {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const { user } = useAuth();

  const toggleLanguage = () => {
    const next = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-[#006C35]/8 shadow-[0_1px_20px_rgba(0,108,53,0.06)]">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#006C35]/10 rounded-full blur-md group-hover:bg-[#C89B3C]/20 transition-all duration-300" />
            <img
              src="/logo-icon.png"
              alt="EcoPilot Arabia"
              className="relative h-10 w-10 object-contain flex-shrink-0"
            />
          </div>
          <span className="hidden sm:inline text-base font-bold tracking-tight leading-none">
            <span className="text-[#1F2937]">EcoPilot </span>
            <span className="text-[#C89B3C]">Arabia</span>
          </span>
        </Link>

        {/* Nav Actions */}
        <div className="flex items-center gap-1">
          {/* New Assessment — always visible */}
          {location !== "/" && (
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-[#6B7280] hover:text-[#006C35] hover:bg-[#006C35]/5 font-medium text-sm rounded-xl"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.newAssessment')}</span>
              </Button>
            </Link>
          )}

          {/* History — auth only */}
          {user && (
            <Link href="/history">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 font-medium text-sm rounded-xl transition-colors ${
                  location === "/history"
                    ? "text-[#006C35] bg-[#006C35]/8"
                    : "text-[#6B7280] hover:text-[#006C35] hover:bg-[#006C35]/5"
                }`}
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.history')}</span>
              </Button>
            </Link>
          )}

          {/* Divider */}
          <div className="h-5 w-px bg-[#006C35]/15 mx-1" />

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-1.5 px-2.5 text-[#6B7280] hover:text-[#006C35] hover:bg-[#006C35]/5 font-semibold text-xs rounded-xl"
          >
            <Globe className="h-4 w-4" />
            <span>{t('nav.language')}</span>
          </Button>

          {/* Profile avatar or Sign In */}
          {user ? (
            <Link href="/profile">
              <button
                title={t('nav.profile')}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ring-2 ring-offset-2 ring-offset-white ${
                  location === "/profile"
                    ? "bg-[#C89B3C] text-white ring-[#C89B3C]"
                    : "bg-[#006C35] text-white ring-transparent hover:ring-[#006C35]/40"
                }`}
              >
                {getInitial(user.email)}
              </button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button
                size="sm"
                className="gap-2 bg-[#006C35] hover:bg-[#004B2A] text-white font-semibold rounded-xl px-4 shadow-sm hover:shadow-[0_4px_12px_rgba(200,155,60,0.35)] transition-all duration-200"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.signIn')}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
