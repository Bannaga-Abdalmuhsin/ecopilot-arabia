import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useListAssessments } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  Building2, Home as HomeIcon, ArrowRight, Loader2, Calendar,
  LogOut, User, Phone, Save, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  userId: string;
  displayName: string | null;
  mobile: string | null;
}

function getInitials(displayName: string | null, email: string | null | undefined): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return (email?.[0] ?? "?").toUpperCase();
}

/** Gets a fresh (auto-refreshed) access token. Returns null if the session is gone. */
async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Throws a typed error so callers can redirect to auth on 401. */
class AuthExpiredError extends Error {}

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await getToken();
  if (!token) throw new AuthExpiredError("No session");
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (res.status === 401) throw new AuthExpiredError("Session expired");
  return res;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: assessments, isLoading: histLoading } = useListAssessments({
    query: { enabled: !!user }
  });

  // Redirect guests
  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  // Fetch profile — always get a fresh token so expired sessions are auto-refreshed
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await apiFetch("/api/profile");
        const data: Profile = await r.json();
        if (!cancelled) {
          setProfile(data);
          setDisplayName(data.displayName ?? "");
          setMobile(data.mobile ?? "");
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof AuthExpiredError) {
          await signOut();
          navigate("/auth");
        } else {
          toast({ title: t("profile.loadError"), variant: "destructive" });
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ displayName: displayName || null, mobile: mobile || null }),
      });
      const data: Profile = await res.json();
      setProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      if (err instanceof AuthExpiredError) {
        await signOut();
        navigate("/auth");
      } else {
        toast({ title: t("profile.saveError"), variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  const initials = getInitials(profile?.displayName ?? null, user.email);

  return (
    <div className="flex-1 bg-muted/20 py-10 px-4 md:px-8">
      <div className="container mx-auto max-w-4xl space-y-8">

        {/* Profile Card */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/80 to-primary" />
          <CardContent className="pt-0 pb-8 px-6 md:px-8">
            {/* Avatar */}
            <div className="-mt-10 mb-5 flex items-end gap-4">
              <div className="h-20 w-20 rounded-full border-4 border-background bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md select-none">
                {initials}
              </div>
              <div className="pb-1">
                <p className="font-semibold text-lg leading-tight">
                  {profile?.displayName || user.email?.split("@")[0]}
                </p>
                <p className="text-sm text-muted-foreground" dir="ltr">{user.email}</p>
              </div>
            </div>

            {/* Editable fields */}
            {profileLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-1.5 text-sm font-medium">
                    <User className="h-3.5 w-3.5 text-primary" />
                    {t("profile.displayName")}
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("profile.displayNamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="flex items-center gap-1.5 text-sm font-medium">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {t("profile.mobile")}
                  </Label>
                  <Input
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+966 5X XXX XXXX"
                    dir="ltr"
                    type="tel"
                  />
                </div>
              </div>
            )}

            {/* Save & Sign out */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={handleSave} disabled={saving || profileLoading} className="min-w-[110px]">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />
                ) : saved ? (
                  <CheckCircle2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 text-green-400" />
                ) : (
                  <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                )}
                {saved ? t("profile.saved") : t("profile.save")}
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4" />
                {t("nav.signOut")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assessment History */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">{t("history.title")}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t("history.subtitle")}</p>

          {histLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !assessments || assessments.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-14 text-center shadow-none border-dashed">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="mb-2 text-base">{t("history.noHistory")}</CardTitle>
              <CardDescription className="max-w-xs mb-5">{t("history.noHistoryDesc")}</CardDescription>
              <Link href="/">
                <Button size="sm">{t("history.startAssessment")}</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow group flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {assessment.buildingType === "residential" ? (
                          <HomeIcon className="h-5 w-5" />
                        ) : (
                          <Building2 className="h-5 w-5" />
                        )}
                      </div>
                      <div className="inline-flex items-center text-xs text-muted-foreground font-medium" dir="ltr">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(assessment.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <CardTitle className="capitalize text-base">
                      {t(`home.form.${assessment.buildingType}`)}
                    </CardTitle>
                    <CardDescription dir="ltr" className="text-left">
                      {assessment.areaM2.toLocaleString()} m² • {assessment.acUnits} AC
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 flex-1">
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("history.monthlyBill")}:</span>
                        <span className="font-semibold" dir="ltr">{assessment.monthlyBillSar.toLocaleString()} SAR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("home.form.lightingType")}:</span>
                        <span className="font-medium capitalize">{t(`home.form.${assessment.lightingType}`)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href={`/dashboard/${assessment.id}`} className="w-full">
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {t("history.viewDashboard")}
                        <ArrowRight className="ltr:ml-2 rtl:mr-2 h-4 w-4 rtl:rotate-180" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
