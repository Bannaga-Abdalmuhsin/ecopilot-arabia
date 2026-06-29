import { useListAssessments } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Building2, Home as HomeIcon, ArrowRight, Loader2, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function History() {
  const { data: assessments, isLoading, error } = useListAssessments();
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col py-8 px-4 md:px-8 bg-muted/20">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('history.title')}</h1>
          <p className="text-muted-foreground">{t('history.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin ltr:mr-3 rtl:ml-3 text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-lg border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
            Failed to load assessments. Please try again.
          </div>
        ) : !assessments || assessments.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center shadow-none border-dashed">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mb-2">{t('history.noHistory')}</CardTitle>
            <CardDescription className="max-w-sm mb-6">
              {t('history.noHistoryDesc')}
            </CardDescription>
            <Link href="/">
              <Button>{t('history.startAssessment')}</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardTitle className="capitalize text-lg">
                    {t(`home.form.${assessment.buildingType}`)}
                  </CardTitle>
                  <CardDescription dir="ltr" className="text-left">
                    {assessment.areaM2.toLocaleString()} m² • {assessment.acUnits} AC
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('history.monthlyBill')}:</span>
                      <span className="font-semibold" dir="ltr">{assessment.monthlyBillSar.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('home.form.lightingType')}:</span>
                      <span className="font-medium capitalize">{t(`home.form.${assessment.lightingType}`)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={`/dashboard/${assessment.id}`} className="w-full">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {t('history.viewDashboard')}
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
  );
}
