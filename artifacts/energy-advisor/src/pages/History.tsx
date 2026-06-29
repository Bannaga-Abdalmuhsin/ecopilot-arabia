import { useListAssessments } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Building2, Home as HomeIcon, ArrowRight, Loader2, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function History() {
  const { data: assessments, isLoading, error } = useListAssessments();

  return (
    <div className="flex-1 flex flex-col py-8 px-4 md:px-8 bg-muted/20">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Assessment History</h1>
          <p className="text-muted-foreground">View and compare your past energy efficiency reports.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
            <span>Loading history...</span>
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
            <CardTitle className="mb-2">No assessments yet</CardTitle>
            <CardDescription className="max-w-sm mb-6">
              You haven't generated any energy reports. Start your first assessment to discover potential savings.
            </CardDescription>
            <Link href="/">
              <Button>Start Assessment</Button>
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
                    <div className="inline-flex items-center text-xs text-muted-foreground font-medium">
                      <Calendar className="mr-1 h-3 w-3" />
                      {format(new Date(assessment.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <CardTitle className="capitalize text-lg">
                    {assessment.buildingType} Property
                  </CardTitle>
                  <CardDescription>
                    {assessment.areaM2.toLocaleString()} m² • {assessment.acUnits} AC Units
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Bill:</span>
                      <span className="font-semibold">{assessment.monthlyBillSar.toLocaleString()} SAR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lighting:</span>
                      <span className="font-medium capitalize">{assessment.lightingType}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={`/dashboard/${assessment.id}`} className="w-full">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      View Report
                      <ArrowRight className="ml-2 h-4 w-4" />
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
