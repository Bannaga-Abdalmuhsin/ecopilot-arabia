import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { 
  useGetAssessment, 
  useGetChatHistory, 
  useSendChatMessage,
  getGetAssessmentQueryKey,
  getGetChatHistoryQueryKey,
  setGuestTokenGetter
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  Download, Leaf, Zap, AlertTriangle, TrendingDown, Info, MessageSquare, 
  Send, Loader2, Star, CheckCircle2, Trees,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Helper components for radial chart (energy score)
const RadialProgress = ({ score, label }: { score: number, label: string }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Color based on score
  let color = "text-red-500";
  if (score >= 80) color = "text-green-500";
  else if (score >= 60) color = "text-yellow-500";
  else if (score >= 40) color = "text-orange-500";

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          className="stroke-muted"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          className={`stroke-current ${color} transition-all duration-1000 ease-out`}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tighter" dir="ltr">{score}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { id } = useParams();
  const assessmentId = Number(id);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Wire guest token for anonymous assessment access
  useEffect(() => {
    if (!assessmentId) return;
    setGuestTokenGetter(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("guestTokens") || "{}");
        return stored[assessmentId] ?? null;
      } catch {
        return null;
      }
    });
    return () => setGuestTokenGetter(null);
  }, [assessmentId]);
  
  const { data: assessmentData, isLoading: assessmentLoading, error: assessmentError } = useGetAssessment(
    assessmentId,
    { query: { enabled: !!assessmentId, queryKey: getGetAssessmentQueryKey(assessmentId) } }
  );

  const { data: chatHistory, isLoading: chatLoading } = useGetChatHistory(
    assessmentId,
    { query: { enabled: !!assessmentId, queryKey: getGetChatHistoryQueryKey(assessmentId) } }
  );

  const sendMessage = useSendChatMessage();

  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sendMessage.isPending) return;

    const currentMsg = messageInput;
    setMessageInput("");
    
    sendMessage.mutate(
      { id: assessmentId, data: { content: currentMsg } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetChatHistoryQueryKey(assessmentId) });
        }
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (assessmentLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  if (assessmentError || !assessmentData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">Report Not Found</h2>
      </div>
    );
  }

  const { assessment, report } = assessmentData;
  const currentAnnualCost = assessment.monthlyBillSar * 12;
  const optimizedAnnualCost = currentAnnualCost - report.potentialSavingsSar;

  // Chart Data
  const breakdownData = [
    { name: t('dashboard.hvac'), value: report.breakdown.hvac, color: "hsl(var(--chart-1))" },
    { name: t('dashboard.lighting'), value: report.breakdown.lighting, color: "hsl(var(--chart-2))" },
    { name: t('dashboard.other'), value: report.breakdown.other, color: "hsl(var(--chart-3))" },
  ];

  const savingsData = [
    {
      name: "SAR",
      [t('dashboard.currentCost')]: currentAnnualCost,
      [t('dashboard.optimizedCost')]: optimizedAnnualCost,
    }
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-muted/10 print:bg-white print:block">
      {/* Main Dashboard Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 space-y-8 print:p-0">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Energy Health Report</h1>
            <p className="text-muted-foreground mt-1 flex items-center">
              <Building2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              <span dir="ltr">{assessment.areaM2.toLocaleString()} m²</span>
              <span className="mx-2">•</span>
              <span>{format(new Date(report.createdAt), "MMMM d, yyyy")}</span>
            </p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="print:hidden bg-background">
            <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t('dashboard.exportPdf')}
          </Button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="flex flex-col items-center justify-center p-6 bg-card border-primary/20 shadow-sm">
            <RadialProgress score={report.energyScore} label={t('dashboard.energyScore')} />
          </Card>
          
          <Card className="flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-destructive flex items-center">
                <AlertTriangle className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
                {t('dashboard.annualWaste')}
              </CardDescription>
              <CardTitle className="text-3xl" dir="ltr">{report.estimatedWastePct}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground" dir="ltr">{report.annualWasteSar.toLocaleString()} SAR</span>
              </p>
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-center bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-primary flex items-center">
                <TrendingDown className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
                {t('dashboard.potentialSavings')}
              </CardDescription>
              <CardTitle className="text-3xl text-primary" dir="ltr">{report.potentialSavingsSar.toLocaleString()} SAR</CardTitle>
            </CardHeader>
          </Card>

          <Card className="flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-emerald-600 dark:text-emerald-500 flex items-center">
                <Leaf className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
                {t('dashboard.carbonReduction')}
              </CardDescription>
              <CardTitle className="text-3xl" dir="ltr">{report.carbonReductionTons} tons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground flex items-center flex-wrap gap-1">
                <Trees className="h-4 w-4 inline text-emerald-600" />
                <span className="font-semibold text-foreground" dir="ltr">{report.treesEquivalent}</span>
                <span>{t('dashboard.treesEquivalent')}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Executive Summary */}
        <Card className="bg-card shadow-sm print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Zap className="h-5 w-5 ltr:mr-2 rtl:ml-2 text-primary" />
              {t('dashboard.executiveSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            {report.executiveSummary.split('\n\n').map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
            ))}
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:break-inside-avoid" dir="ltr">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-center">{t('dashboard.costBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value}%`, 'Share']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-center">{t('dashboard.savingsComparison')}</CardTitle>
            </CardHeader>
            <CardContent className="h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <RechartsTooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey={t('dashboard.currentCost')} fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} barSize={60} />
                  <Bar dataKey={t('dashboard.optimizedCost')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={60} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="space-y-4 print:break-before-page">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">{t('dashboard.recommendations')}</h3>
            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
              {t('dashboard.priority')}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {report.recommendations.map((rec, i) => (
              <Card key={i} className="overflow-hidden shadow-sm hover:border-primary/50 transition-colors">
                <div className="flex flex-col md:flex-row">
                  {/* Left column - metrics */}
                  <div className="bg-muted/30 p-6 md:w-64 flex flex-col justify-center border-b md:border-b-0 md:ltr:border-r md:rtl:border-l border-border">
                    <div className="flex items-center mb-4" dir="ltr">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star 
                          key={starIdx} 
                          className={`h-4 w-4 ${starIdx < rec.priorityStars ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} 
                        />
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('dashboard.savings')}</p>
                        <p className="text-xl font-bold text-primary" dir="ltr">{rec.savingsSar.toLocaleString()} SAR</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('dashboard.payback')}</p>
                        <p className="font-medium text-foreground">
                          {rec.roiYears < 1 
                            ? `${Math.round(rec.roiYears * 12)} ${t('dashboard.months')}` 
                            : `${rec.roiYears} ${t('dashboard.years')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column - content */}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 ltr:mr-3 rtl:ml-3 shrink-0" />
                      <div>
                        <h4 className="text-lg font-bold mb-2">{rec.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{rec.rationale}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
      </div>

      {/* AI Chat Panel - hidden when printing */}
      <div className="w-full lg:w-96 ltr:border-l rtl:border-r bg-card flex flex-col h-[500px] lg:h-auto print:hidden shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
        <div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <h3 className="font-semibold flex items-center text-foreground">
            <MessageSquare className="h-4 w-4 ltr:mr-2 rtl:ml-2 text-primary" />
            {t('dashboard.chat.title')}
          </h3>
        </div>
        
        <ScrollArea className="flex-1 p-4 bg-muted/10">
          <div className="space-y-4">
            {chatLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              </div>
            ) : chatHistory && chatHistory.length > 0 ? (
              chatHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground ltr:rounded-br-none rtl:rounded-bl-none' 
                        : 'bg-card border shadow-sm text-card-foreground ltr:rounded-bl-none rtl:rounded-br-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                <Info className="h-8 w-8 mb-3" />
              </div>
            )}
            
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-card border shadow-sm text-card-foreground ltr:rounded-bl-none rtl:rounded-br-none flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
              placeholder={t('dashboard.chat.placeholder')} 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={sendMessage.isPending}
              className="flex-1 focus-visible:ring-primary"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!messageInput.trim() || sendMessage.isPending}
              className="shrink-0 ltr:rotate-0 rtl:rotate-180"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
