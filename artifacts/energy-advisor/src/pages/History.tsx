import { useListAssessments, getListAssessmentsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Building2, Home as HomeIcon, ArrowRight, Loader2, Calendar, LogIn, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const { data: assessments, isLoading, error } = useListAssessments({
    query: { enabled: !!user, queryKey: getListAssessmentsQueryKey() }
  });
  const { t } = useTranslation();

  if (!authLoading && !user) {
    return (
      <div className="flex-1 flex flex-col bg-[#F8FAF9] py-14 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-[#1F2937] mb-2">{t('history.title')}</h1>
            <p className="text-[#6B7280]">{t('history.subtitle')}</p>
          </div>
          <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#006C35]/10 to-[#C89B3C]/10 flex items-center justify-center mb-5">
              <LogIn className="h-8 w-8 text-[#006C35]" />
            </div>
            <h2 className="text-xl font-bold text-[#1F2937] mb-2">{t('history.signInRequired')}</h2>
            <p className="text-[#6B7280] max-w-sm text-sm mb-7 leading-relaxed">{t('history.signInRequiredDesc')}</p>
            <Link href="/auth">
              <Button className="btn-premium px-8 font-semibold">{t('nav.signIn')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAF9] py-14 px-4 md:px-8">
      <div className="container mx-auto max-w-5xl">

        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="ai-badge mb-3 w-fit">
              <HistoryIcon className="h-3 w-3" />
              {t('history.badge')}
            </div>
            <h1 className="text-3xl font-extrabold text-[#1F2937]">{t('history.title')}</h1>
            <p className="text-[#6B7280] mt-1">{t('history.subtitle')}</p>
          </div>
          <Link href="/">
            <Button className="btn-premium gap-2 font-semibold hidden sm:flex">
              + {t('history.startAssessment')}
            </Button>
          </Link>
        </div>

        {isLoading || authLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#006C35] to-[#008A43] flex items-center justify-center shadow-[0_8px_24px_rgba(0,108,53,0.25)]">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
              <p className="text-[#6B7280] text-sm font-medium">{t('history.loading')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center text-red-600">
            Failed to load assessments. Please try again.
          </div>
        ) : !assessments || assessments.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#006C35]/10 to-[#C89B3C]/10 flex items-center justify-center mb-5">
              <Building2 className="h-8 w-8 text-[#006C35]" />
            </div>
            <h2 className="text-xl font-bold text-[#1F2937] mb-2">{t('history.noHistory')}</h2>
            <p className="text-[#6B7280] max-w-sm text-sm mb-7 leading-relaxed">{t('history.noHistoryDesc')}</p>
            <Link href="/">
              <Button className="btn-premium px-8 font-semibold">{t('history.startAssessment')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="glass-card flex flex-col overflow-hidden hover:shadow-[0_12px_40px_rgba(0,108,53,0.12)] hover:-translate-y-1 transition-all duration-200 group"
              >
                {/* Card top accent */}
                <div className="h-1 w-full bg-gradient-to-r from-[#006C35] to-[#C89B3C]" />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Header row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#006C35]/10 to-[#C89B3C]/10 flex items-center justify-center">
                      {assessment.buildingType === "residential"
                        ? <HomeIcon className="h-5 w-5 text-[#006C35]" />
                        : <Building2 className="h-5 w-5 text-[#006C35]" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#6B7280] font-medium" dir="ltr">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(assessment.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#1F2937] capitalize mb-1">
                    {t(`home.form.${assessment.buildingType}`)}
                  </h3>
                  <p className="text-xs text-[#6B7280] mb-4" dir="ltr">
                    {assessment.areaM2.toLocaleString()} m² · {assessment.acUnits} AC units
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex justify-between items-center text-sm bg-[#F8FAF9] rounded-lg px-3 py-2">
                      <span className="text-[#6B7280] font-medium">{t('history.monthlyBill')}</span>
                      <span className="font-bold text-[#1F2937]" dir="ltr">{assessment.monthlyBillSar.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between items-center text-sm bg-[#F8FAF9] rounded-lg px-3 py-2">
                      <span className="text-[#6B7280] font-medium">{t('home.form.lightingType')}</span>
                      <span className="font-semibold text-[#1F2937] capitalize">{t(`home.form.${assessment.lightingType}`)}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={`/dashboard/${assessment.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-[#006C35]/15 text-[#006C35] font-semibold group-hover:bg-[#006C35] group-hover:text-white group-hover:border-[#006C35] transition-all duration-200 gap-2"
                    >
                      {t('history.viewDashboard')}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
