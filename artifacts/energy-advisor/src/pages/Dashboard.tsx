import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import {
  useGetAssessment, useGetChatHistory, useSendChatMessage,
  getGetAssessmentQueryKey, getGetChatHistoryQueryKey, setGuestTokenGetter
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Download, Leaf, Zap, AlertTriangle, TrendingDown, MessageSquare,
  Send, Loader2, Star, CheckCircle2, Trees, Building2, Brain, Sparkles, Bot
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ── Animated Radial Energy Score ─────────────────────────── */
const RadialScore = ({ score }: { score: number }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let trackColor = "#DC2626";
  if (score >= 80) trackColor = "#006C35";
  else if (score >= 60) trackColor = "#C89B3C";
  else if (score >= 40) trackColor = "#F59E0B";

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} stroke="#E8F0EC" strokeWidth="10" fill="none" />
        <circle
          cx="70" cy="70" r={radius}
          stroke={trackColor} strokeWidth="10" strokeLinecap="round" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-[#1F2937]" dir="ltr">{score}</span>
        <span className="text-[10px] text-[#6B7280] uppercase tracking-widest font-semibold mt-0.5">Score</span>
      </div>
    </div>
  );
};

/* ── KPI Card ──────────────────────────────────────────────── */
const KpiCard = ({
  icon: Icon, iconBg, label, value, sub, subColor = "#6B7280"
}: {
  icon: React.ElementType; iconBg: string; label: string; value: string; sub?: string; subColor?: string;
}) => (
  <div className="glass-card p-6 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform duration-200">
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-[#1F2937]" dir="ltr">{value}</p>
      {sub && <p className="text-xs text-[#6B7280] mt-1" style={{ color: subColor }}>{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const { id } = useParams();
  const assessmentId = Number(id);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  useEffect(() => {
    if (!assessmentId) return;
    setGuestTokenGetter(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("guestTokens") || "{}");
        return stored[assessmentId] ?? null;
      } catch { return null; }
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
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sendMessage.isPending) return;
    const msg = messageInput;
    setMessageInput("");
    sendMessage.mutate(
      { id: assessmentId, data: { content: msg } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetChatHistoryQueryKey(assessmentId) }) }
    );
  };

  if (assessmentLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#006C35] to-[#008A43] flex items-center justify-center shadow-[0_8px_24px_rgba(0,108,53,0.25)]">
            <Loader2 className="h-7 w-7 text-white animate-spin" />
          </div>
          <p className="text-[#6B7280] font-medium text-sm">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (assessmentError || !assessmentData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAF9]">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2">{t('dashboard.reportNotFound')}</h2>
        <p className="text-[#6B7280]">{t('dashboard.reportNotFoundDesc')}</p>
      </div>
    );
  }

  const { assessment, report } = assessmentData;
  const currentAnnualCost = assessment.monthlyBillSar * 12;
  const optimizedAnnualCost = currentAnnualCost - report.potentialSavingsSar;

  const breakdownData = [
    { name: t('dashboard.hvac'), value: report.breakdown.hvac, color: "#006C35" },
    { name: t('dashboard.lighting'), value: report.breakdown.lighting, color: "#C89B3C" },
    { name: t('dashboard.other'), value: report.breakdown.other, color: "#E8C874" },
  ];
  const savingsData = [{
    name: "SAR",
    [t('dashboard.currentCost')]: currentAnnualCost,
    [t('dashboard.optimizedCost')]: optimizedAnnualCost,
  }];

  const priorityClass = (stars: number) =>
    stars >= 4 ? "priority-high" : stars === 3 ? "priority-medium" : "priority-low";

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F8FAF9] print:bg-white print:block">

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-auto p-4 md:p-8 space-y-8 print:p-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="ai-badge mb-2">
              <Sparkles className="h-3 w-3" />
              ✨ {t('dashboard.aiGenerated')}
            </div>
            <h1 className="text-2xl font-extrabold text-[#1F2937]">{t('dashboard.executiveSummary')}</h1>
            <p className="text-[#6B7280] mt-1 flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4" />
              <span dir="ltr">{assessment.areaM2.toLocaleString()} m²</span>
              <span className="text-[#006C35]/30">•</span>
              <span>{format(new Date(report.createdAt), "MMMM d, yyyy")}</span>
            </p>
          </div>
          <Button
            onClick={() => window.print()} variant="outline"
            className="print:hidden border-[#006C35]/20 text-[#006C35] hover:bg-[#006C35]/5 rounded-xl gap-2 font-semibold"
          >
            <Download className="h-4 w-4" />
            {t('dashboard.exportPdf')}
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Energy Score */}
          <div className="glass-card p-6 flex flex-col items-center justify-center col-span-1 hover:-translate-y-0.5 transition-transform duration-200">
            <RadialScore score={report.energyScore} />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mt-3">{t('dashboard.energyScore')}</p>
          </div>

          <KpiCard
            icon={AlertTriangle}
            iconBg="bg-gradient-to-br from-red-400 to-red-600"
            label={t('dashboard.annualWaste')}
            value={`${report.estimatedWastePct}%`}
            sub={`${report.annualWasteSar.toLocaleString()} SAR`}
            subColor="#DC2626"
          />
          <KpiCard
            icon={TrendingDown}
            iconBg="bg-gradient-to-br from-[#006C35] to-[#008A43]"
            label={t('dashboard.potentialSavings')}
            value={`${report.potentialSavingsSar.toLocaleString()}`}
            sub="SAR / year"
            subColor="#006C35"
          />
          <KpiCard
            icon={Leaf}
            iconBg="bg-gradient-to-br from-emerald-400 to-emerald-600"
            label={t('dashboard.carbonReduction')}
            value={`${report.carbonReductionTons}t`}
            sub={`≈ ${report.treesEquivalent} ${t('dashboard.treesEquivalent')}`}
            subColor="#16A34A"
          />
        </div>

        {/* Executive Summary */}
        <div className="glass-card p-8 print:break-inside-avoid">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#006C35] to-[#008A43] flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-[#1F2937]">{t('dashboard.executiveSummary')}</h2>
            <div className="ai-badge ml-auto">
              <Brain className="h-3 w-3" />
              {t('dashboard.aiAnalysis')}
            </div>
          </div>
          <div className="space-y-3">
            {report.executiveSummary.split('\n\n').map((p, i) => (
              <p key={i} className="text-[#6B7280] leading-relaxed text-sm">{p}</p>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:break-inside-avoid" dir="ltr">
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-[#1F2937] mb-5 text-center">{t('dashboard.costBreakdown')}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value">
                  {breakdownData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip
                  formatter={(v: number) => [`${v}%`, 'Share']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,108,53,0.12)', fontFamily: 'Poppins' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-[#1F2937] mb-5 text-center">{t('dashboard.savingsComparison')}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={savingsData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,108,53,0.08)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'Poppins' }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Poppins' }} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(0,108,53,0.04)', radius: 8 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,108,53,0.12)', fontFamily: 'Poppins' }}
                />
                <Bar dataKey={t('dashboard.currentCost')} fill="#E8C874" radius={[8, 8, 0, 0]} barSize={50} />
                <Bar dataKey={t('dashboard.optimizedCost')} fill="#006C35" radius={[8, 8, 0, 0]} barSize={50} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4 print:break-before-page">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-[#1F2937]">{t('dashboard.recommendations')}</h3>
            <span className="text-xs text-[#6B7280] bg-white border border-[#006C35]/10 px-3 py-1.5 rounded-full font-semibold shadow-sm">
              {t('dashboard.priority')}
            </span>
          </div>

          <div className="space-y-4">
            {report.recommendations.map((rec, i) => (
              <div
                key={i}
                className={`glass-card overflow-hidden hover:shadow-[0_8px_32px_rgba(0,108,53,0.1)] hover:-translate-y-0.5 transition-all duration-200 ${priorityClass(rec.priorityStars)}`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Metrics Panel */}
                  <div className="bg-gradient-to-br from-[#F8FAF9] to-[#F0F7F3] p-6 md:w-56 flex flex-col justify-center gap-4 border-b md:border-b-0 md:ltr:border-r md:rtl:border-l border-[#006C35]/8">
                    <div className="flex items-center gap-0.5" dir="ltr">
                      {[...Array(5)].map((_, si) => (
                        <Star key={si} className={`h-3.5 w-3.5 ${si < rec.priorityStars ? "text-[#C89B3C] fill-[#C89B3C]" : "text-[#E8C874]/30"}`} />
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-semibold mb-0.5">{t('dashboard.savings')}</p>
                      <p className="text-xl font-extrabold text-[#006C35]" dir="ltr">{rec.savingsSar.toLocaleString()} <span className="text-sm font-semibold">SAR</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-semibold mb-0.5">{t('dashboard.payback')}</p>
                      <p className="text-sm font-semibold text-[#1F2937]">
                        {rec.roiYears < 1
                          ? `${Math.round(rec.roiYears * 12)} ${t('dashboard.months')}`
                          : `${rec.roiYears} ${t('dashboard.years')}`}
                      </p>
                    </div>
                  </div>

                  {/* Content Panel */}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg bg-[#006C35]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-[#006C35]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#1F2937] mb-1.5">{rec.title}</h4>
                        <p className="text-[#6B7280] text-sm leading-relaxed">{rec.rationale}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Chat Panel ── */}
      <div className="w-full lg:w-96 bg-white ltr:border-l rtl:border-r border-[#006C35]/8 flex flex-col h-[480px] lg:h-auto print:hidden shadow-[-8px_0_24px_rgba(0,108,53,0.04)] z-10">
        {/* Chat Header */}
        <div className="p-4 border-b border-[#006C35]/8 bg-gradient-to-r from-[#006C35] to-[#008A43]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{t('dashboard.chat.title')}</h3>
              <p className="text-white/60 text-[11px]">{t('dashboard.chat.poweredBy')}</p>
            </div>
            <div className="ml-auto h-2 w-2 rounded-full bg-[#E8C874] animate-pulse" />
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 bg-[#F8FAF9]">
          <div className="space-y-3">
            {chatLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-5 w-5 text-[#006C35] animate-spin" />
              </div>
            ) : chatHistory && chatHistory.length > 0 ? (
              chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role !== 'user' && (
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#006C35] to-[#008A43] flex items-center justify-center shrink-0 mt-1 ltr:mr-2 rtl:ml-2">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#006C35] text-white ltr:rounded-br-sm rtl:rounded-bl-sm'
                      : 'bg-white border border-[#006C35]/8 text-[#1F2937] ltr:rounded-bl-sm rtl:rounded-br-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <div className="h-12 w-12 rounded-2xl bg-[#006C35]/8 flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6 text-[#006C35]/50" />
                </div>
                <p className="text-[#6B7280] text-xs">{t('dashboard.chat.prompt')}</p>
              </div>
            )}
            {sendMessage.isPending && (
              <div className="flex justify-start items-end gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#006C35] to-[#008A43] flex items-center justify-center shrink-0">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-white border border-[#006C35]/8 rounded-2xl ltr:rounded-bl-sm rtl:rounded-br-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#006C35] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#006C35] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#006C35] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-[#006C35]/8 bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder={t('dashboard.chat.placeholder')}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={sendMessage.isPending}
              className="flex-1 rounded-xl border-[#006C35]/15 focus-visible:ring-[#006C35]/20 bg-[#F8FAF9] text-sm"
            />
            <Button
              type="submit" size="icon"
              disabled={!messageInput.trim() || sendMessage.isPending}
              className="shrink-0 rounded-xl bg-[#006C35] hover:bg-[#004B2A] shadow-[0_4px_12px_rgba(0,108,53,0.25)] hover:shadow-[0_4px_16px_rgba(200,155,60,0.35)] transition-all duration-200 rtl:rotate-180"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
