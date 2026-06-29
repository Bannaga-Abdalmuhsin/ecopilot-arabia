import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Home as HomeIcon, Zap, Loader2, ArrowRight, ArrowLeft,
  Mail, MessageCircle, Phone, Brain, Leaf, TrendingDown, Shield
} from "lucide-react";
import { useCreateAssessment } from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  buildingType: z.enum(["residential", "commercial"]),
  areaM2: z.coerce.number().min(10, "Area must be at least 10 m²").max(100000, "Area too large"),
  monthlyBillSar: z.coerce.number().min(10, "Bill must be at least 10 SAR").max(1000000, "Bill too large"),
  acUnits: z.coerce.number().min(0).max(1000),
  lightingType: z.enum(["fluorescent", "led", "incandescent"]),
  workingHours: z.coerce.number().min(1).max(24).optional().nullable(),
  buildingAge: z.coerce.number().min(0).max(200),
  hasSolar: z.boolean().default(false),
  hasSmartThermostat: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

// Feature labels resolved via t() inside component

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const createAssessment = useCreateAssessment();

  const features = [
    { icon: Brain, label: t('home.hero.features.aiAnalysis') },
    { icon: Leaf, label: t('home.hero.features.carbonImpact') },
    { icon: TrendingDown, label: t('home.hero.features.costReduction') },
    { icon: Shield, label: t('home.hero.features.saudiStandards') },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buildingType: "residential",
      areaM2: 250,
      monthlyBillSar: 800,
      acUnits: 5,
      lightingType: "led",
      workingHours: null,
      buildingAge: 10,
      hasSolar: false,
      hasSmartThermostat: false,
    },
  });

  const buildingType = form.watch("buildingType");

  const onSubmit = async (data: FormValues) => {
    try {
      createAssessment.mutate({ data }, {
        onSuccess: (response) => {
          const guestToken = (response as any).guestToken;
          if (guestToken) {
            try {
              const stored = JSON.parse(localStorage.getItem("guestTokens") || "{}");
              stored[response.assessment.id] = guestToken;
              localStorage.setItem("guestTokens", JSON.stringify(stored));
            } catch { /* localStorage unavailable */ }
          }
          setLocation(`/dashboard/${response.assessment.id}`);
        },
        onError: (error) => {
          toast({
            title: "Assessment Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
          });
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["buildingType", "areaM2", "monthlyBillSar"];
    else if (step === 2) {
      fieldsToValidate = ["acUnits", "lightingType", "buildingAge"];
      if (buildingType === "commercial") fieldsToValidate.push("workingHours");
    }
    const isStepValid = await form.trigger(fieldsToValidate as any);
    if (isStepValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  if (createAssessment.isPending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#006C35]/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative z-10 h-20 w-20 rounded-full bg-gradient-to-br from-[#006C35] to-[#008A43] flex items-center justify-center shadow-[0_8px_32px_rgba(0,108,53,0.3)]">
            <Loader2 className="h-9 w-9 text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2">{t('home.form.analyzing')}</h2>
        <p className="text-[#6B7280] max-w-sm">{t('home.form.analyzingDesc')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden hero-gradient pattern-bg py-24 lg:py-32">
        {/* Glowing orbs */}
        <div className="absolute top-0 ltr:right-0 rtl:left-0 w-[500px] h-[500px] glow-gold opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-[400px] h-[400px] glow-green opacity-50 pointer-events-none" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pattern-bg pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="max-w-3xl space-y-7">
            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {features.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-white/90 backdrop-blur-sm">
                  <Icon className="h-3 w-3 text-[#E8C874]" />
                  {label}
                </span>
              ))}
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-[1.1]">
              {t('home.hero.title')}{" "}
              <br className="hidden sm:block" />
              <span className="text-[#E8C874]">{t('home.hero.titleHighlight')}</span>
            </h1>

            <p className="max-w-xl text-lg text-white/75 leading-relaxed">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-[#C89B3C]/60" />
              <span className="text-xs text-[#E8C874]/80 font-semibold tracking-widest uppercase">{t('home.hero.saudiVision')}</span>
              <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-[#C89B3C]/60" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Assessment Form ── */}
      <section className="flex-1 py-14 bg-[#F8FAF9]">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">

          {/* Step Indicator */}
          <div className="mb-10 flex items-center justify-between relative">
            <div className="absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#006C35]/10 rounded-full" />
            <div
              className="absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full transition-all duration-700 ease-in-out"
              style={{
                width: `${((step - 1) / 2) * 100}%`,
                background: "linear-gradient(90deg, #006C35, #C89B3C)",
              }}
            />
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-1.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  step > i
                    ? "bg-[#C89B3C] text-white shadow-[0_4px_12px_rgba(200,155,60,0.4)]"
                    : step === i
                    ? "bg-[#006C35] text-white shadow-[0_4px_12px_rgba(0,108,53,0.35)]"
                    : "bg-white border-2 border-[#006C35]/20 text-[#6B7280]"
                }`}>
                  {step > i ? "✓" : i}
                </div>
              </div>
            ))}
          </div>

          {/* Glass Form Card */}
          <div className="glass-card overflow-hidden">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Card Header */}
                <div className="px-8 pt-8 pb-6 border-b border-[#006C35]/6">
                  <div className="ai-badge mb-3">
                    <Zap className="h-3 w-3" />
                    ✨ {t('home.form.aiLabel')}
                  </div>
                  <h2 className="text-xl font-bold text-[#1F2937]">
                    {step === 1 && t('home.form.step1Title')}
                    {step === 2 && t('home.form.step2Title')}
                    {step === 3 && t('home.form.step3Title')}
                  </h2>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {step === 1 && t('home.form.step1Desc')}
                    {step === 2 && t('home.form.step2Desc')}
                    {step === 3 && t('home.form.step3Desc')}
                  </p>
                </div>

                {/* Card Body */}
                <div className="px-8 py-7">
                  <AnimatePresence mode="wait">
                    {/* Step 1 */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control} name="buildingType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-[#1F2937] font-semibold">{t('home.form.buildingType')}</FormLabel>
                              <FormControl>
                                <div className="grid grid-cols-2 gap-4">
                                  {[
                                    { value: "residential", icon: HomeIcon, label: t('home.form.residential') },
                                    { value: "commercial", icon: Building2, label: t('home.form.commercial') },
                                  ].map(({ value, icon: Icon, label }) => (
                                    <label key={value} className={`flex flex-col items-center justify-center rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 ${
                                      field.value === value
                                        ? "border-[#006C35] bg-[#006C35]/5 text-[#006C35] shadow-[0_4px_16px_rgba(0,108,53,0.12)]"
                                        : "border-[#006C35]/10 bg-white hover:border-[#006C35]/30 hover:bg-[#006C35]/3 text-[#6B7280]"
                                    }`}>
                                      <input type="radio" value={value} className="sr-only" checked={field.value === value} onChange={() => field.onChange(value)} />
                                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-3 ${field.value === value ? "bg-[#006C35]/10" : "bg-[#F8FAF9]"}`}>
                                        <Icon className="h-6 w-6" />
                                      </div>
                                      <span className="text-sm font-semibold">{label}</span>
                                    </label>
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField control={form.control} name="areaM2" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#1F2937] font-semibold text-sm">{t('home.form.areaM2')}</FormLabel>
                              <FormControl>
                                <Input type="number" dir="ltr" className="text-left rounded-xl border-[#006C35]/15 focus:border-[#006C35] focus-visible:ring-[#006C35]/20 bg-white h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="monthlyBillSar" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#1F2937] font-semibold text-sm">{t('home.form.monthlyBill')}</FormLabel>
                              <FormControl>
                                <Input type="number" dir="ltr" className="text-left rounded-xl border-[#006C35]/15 focus:border-[#006C35] focus-visible:ring-[#006C35]/20 bg-white h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField control={form.control} name="acUnits" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#1F2937] font-semibold text-sm">{t('home.form.acUnits')}</FormLabel>
                              <FormControl>
                                <Input type="number" dir="ltr" className="text-left rounded-xl border-[#006C35]/15 focus:border-[#006C35] focus-visible:ring-[#006C35]/20 bg-white h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="buildingAge" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#1F2937] font-semibold text-sm">{t('home.form.buildingAge')}</FormLabel>
                              <FormControl>
                                <Input type="number" dir="ltr" className="text-left rounded-xl border-[#006C35]/15 focus:border-[#006C35] focus-visible:ring-[#006C35]/20 bg-white h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="lightingType" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#1F2937] font-semibold text-sm">{t('home.form.lightingType')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} dir={document.documentElement.dir as any}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl border-[#006C35]/15 focus:ring-[#006C35]/20 bg-white h-11">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="led">{t('home.form.led')}</SelectItem>
                                <SelectItem value="fluorescent">{t('home.form.fluorescent')}</SelectItem>
                                <SelectItem value="incandescent">{t('home.form.incandescent')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        {buildingType === "commercial" && (
                          <FormField control={form.control} name="workingHours" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#1F2937] font-semibold text-sm">{t('home.form.workingHours')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number" dir="ltr"
                                  className="text-left rounded-xl border-[#006C35]/15 focus:border-[#006C35] focus-visible:ring-[#006C35]/20 bg-white h-11"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </motion.div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {[
                          { name: "hasSolar" as const, label: t('home.form.hasSolar'), icon: "☀️" },
                          { name: "hasSmartThermostat" as const, label: t('home.form.hasSmartThermostat'), icon: "🌡️" },
                        ].map(({ name, label, icon }) => (
                          <FormField key={name} control={form.control} name={name} render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-[#006C35]/10 bg-white px-6 py-5 hover:border-[#006C35]/25 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{icon}</span>
                                <FormLabel className="text-base font-semibold text-[#1F2937] cursor-pointer">{label}</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-[#006C35]"
                                />
                              </FormControl>
                            </FormItem>
                          )} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-center px-8 py-6 border-t border-[#006C35]/6 bg-[#F8FAF9]/60">
                  <Button
                    type="button" variant="ghost" onClick={prevStep} disabled={step === 1}
                    className="gap-2 text-[#6B7280] hover:text-[#006C35] hover:bg-[#006C35]/5 rounded-xl font-semibold disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                    {t('home.form.back')}
                  </Button>
                  {step < 3 ? (
                    <Button type="button" onClick={nextStep} className="btn-premium gap-2 px-6 font-semibold">
                      {t('home.form.next')}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={createAssessment.isPending} className="btn-premium gap-2 px-6 font-semibold">
                      {createAssessment.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />{t('home.form.analyzing')}</>
                      ) : (
                        <><Zap className="h-4 w-4" />{t('home.form.submit')}</>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* ── Consultation Section ── */}
      <section className="py-16 bg-white border-t border-[#006C35]/6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <div className="ai-badge mx-auto w-fit mb-4">
              <MessageCircle className="h-3 w-3" />
              {t('home.consultation.badge')}
            </div>
            <h2 className="text-3xl font-bold text-[#1F2937] mb-3">{t('home.consultation.title')}</h2>
            <p className="text-[#6B7280] text-lg max-w-lg mx-auto">{t('home.consultation.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              { href: "mailto:bannaga.altieb@gmail.com", icon: Mail, label: t('home.consultation.emailLabel'), value: "bannaga.altieb@gmail.com" },
              { href: "https://wa.me/966542966343", icon: MessageCircle, label: t('home.consultation.whatsappLabel'), value: "+966 54 296 6343" },
              { href: "tel:+966507055677", icon: Phone, label: t('home.consultation.phoneLabel'), value: "+966 50 705 5677" },
            ].map(({ href, icon: Icon, label, value }) => (
              <a key={href} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group block">
                <div className="glass-card p-6 flex flex-col items-center text-center hover:shadow-[0_8px_32px_rgba(0,108,53,0.12)] hover:-translate-y-1 transition-all duration-200">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#006C35]/10 to-[#C89B3C]/10 flex items-center justify-center mb-4 group-hover:from-[#006C35] group-hover:to-[#008A43] transition-all duration-300">
                    <Icon className="h-5 w-5 text-[#006C35] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold text-[#1F2937] mb-1">{label}</h3>
                  <p className="text-[#6B7280] text-sm" dir="ltr">{value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
