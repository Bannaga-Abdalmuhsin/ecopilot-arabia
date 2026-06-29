import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Home as HomeIcon, Zap, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useCreateAssessment } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const createAssessment = useCreateAssessment();

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
      createAssessment.mutate(
        { data },
        {
          onSuccess: (response) => {
            setLocation(`/dashboard/${response.assessment.id}`);
          },
          onError: (error) => {
            toast({
              title: "Assessment Failed",
              description: error.message || "An unexpected error occurred.",
              variant: "destructive",
            });
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ["buildingType", "areaM2", "monthlyBillSar"];
    } else if (step === 2) {
      fieldsToValidate = ["acUnits", "lightingType", "buildingAge"];
      if (buildingType === "commercial") {
        fieldsToValidate.push("workingHours");
      }
    }

    const isStepValid = await form.trigger(fieldsToValidate as any);
    if (isStepValid) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
  };

  if (createAssessment.isPending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
          <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
        </div>
        <h2 className="mt-8 text-2xl font-bold tracking-tight">Analyzing your building...</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">
          Our AI consultant is processing your data against Saudi energy standards to generate precise recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-foreground text-background py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/30 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Zap className="mr-2 h-4 w-4" />
              Saudi Arabia Energy Standards
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Intelligence for <br className="hidden sm:block" />
              <span className="text-primary">Energy Efficiency.</span>
            </h1>
            <p className="max-w-[600px] text-lg text-muted md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Reduce energy consumption, lower costs, and receive personalized AI recommendations in under one minute.
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Form */}
      <section className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <div className="mb-8 flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold text-sm transition-colors duration-300 ${
                  step >= i 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {i}
              </div>
            ))}
          </div>

          <Card className="shadow-lg border-primary/10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>
                    {step === 1 && "Basic Information"}
                    {step === 2 && "Building Details"}
                    {step === 3 && "Smart Features & Review"}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && "Tell us about the property you want to assess."}
                    {step === 2 && "Detailed information helps us calculate precise HVAC and lighting costs."}
                    {step === 3 && "Final details before we generate your AI report."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="buildingType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Building Type</FormLabel>
                              <FormControl>
                                <div className="grid grid-cols-2 gap-4">
                                  <label
                                    className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent cursor-pointer transition-all ${
                                      field.value === "residential" ? "border-primary bg-primary/5 text-primary" : ""
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      value="residential"
                                      className="sr-only"
                                      checked={field.value === "residential"}
                                      onChange={() => field.onChange("residential")}
                                    />
                                    <HomeIcon className="mb-3 h-6 w-6" />
                                    <span className="text-sm font-semibold">Residential</span>
                                  </label>
                                  <label
                                    className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent cursor-pointer transition-all ${
                                      field.value === "commercial" ? "border-primary bg-primary/5 text-primary" : ""
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      value="commercial"
                                      className="sr-only"
                                      checked={field.value === "commercial"}
                                      onChange={() => field.onChange("commercial")}
                                    />
                                    <Building2 className="mb-3 h-6 w-6" />
                                    <span className="text-sm font-semibold">Commercial</span>
                                  </label>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="areaM2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Area (m²)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="monthlyBillSar"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Avg. Monthly Bill (SAR)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="acUnits"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Number of AC Units</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Split, Window or Package units</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="buildingAge"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Building Age (Years)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="lightingType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Lighting Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select lighting type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="led">LED (Highly Efficient)</SelectItem>
                                  <SelectItem value="fluorescent">Fluorescent / CFL (Moderate)</SelectItem>
                                  <SelectItem value="incandescent">Incandescent / Halogen (Inefficient)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {buildingType === "commercial" && (
                          <FormField
                            control={form.control}
                            name="workingHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Daily Working Hours</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    value={field.value ?? ""} 
                                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>Average operating hours per day</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="space-y-4 rounded-lg border p-4 bg-card">
                          <FormField
                            control={form.control}
                            name="hasSolar"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Solar Panels</FormLabel>
                                  <FormDescription>
                                    Are solar panels installed on the property?
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <div className="h-px w-full bg-border" />
                          
                          <FormField
                            control={form.control}
                            name="hasSmartThermostat"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Smart Thermostats</FormLabel>
                                  <FormDescription>
                                    Do you use programmable or smart AC controls?
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                          <h4 className="font-semibold text-primary mb-2 flex items-center">
                            <Zap className="h-4 w-4 mr-2" />
                            Ready for Analysis
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            You're about to submit this profile to our AI energy consultant. The analysis takes just a few seconds and provides a comprehensive breakdown of your potential savings.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  
                  {step < 3 ? (
                    <Button type="button" onClick={nextStep}>
                      Next Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={createAssessment.isPending}>
                      {createAssessment.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Generate Report
                          <Zap className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </section>
    </div>
  );
}
