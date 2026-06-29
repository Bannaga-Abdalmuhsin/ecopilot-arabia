# Hackathon Submission — EcoPilot Arabia
## Submit Your Agentic AI Project

---

### 1. Title of Your Agentic AI Project
**EcoPilot Arabia — Agentic AI Energy Efficiency Advisor for Saudi Arabia**

---

### 2. Job Function
**Energy Management / Sustainability / AI & Technology**

---

### 3. What problem does your AI tool solve?

Building owners and facility managers across Saudi Arabia have no fast, affordable way to understand their energy consumption or identify cost-saving opportunities. Traditional energy audits cost thousands of Saudi Riyals, require licensed engineers, and take weeks to complete — making them inaccessible to the vast majority of homeowners, SMEs, and mid-size commercial operators.

Meanwhile, Saudi Arabia's extreme desert climate means HVAC systems alone account for up to 70% of total electricity bills. With energy subsidies being reformed under Vision 2030 and electricity tariffs rising for commercial users, the financial impact of energy inefficiency is growing every year — yet no accessible, intelligent tool existed to help ordinary people act on it quickly.

---

### 4. How does your AI tool solve the problem?

EcoPilot Arabia is a fully agentic AI web application that delivers a complete, personalized energy efficiency assessment in under 60 seconds — at zero cost.

**Step-by-step:**

1. **Input**: The user fills a guided 3-step form with their building type (residential/commercial), total area (m²), average monthly electricity bill (SAR), number of AC units, lighting type, building age, solar panel status, and smart thermostat presence.

2. **AI Analysis**: The backend AI engine processes the inputs against calibrated Saudi energy benchmarks — accounting for the Kingdom's climate zones and SEC (Saudi Electricity Company) tariff structures — and generates a comprehensive report using GPT-4o.

3. **Energy Score**: A 0–100 efficiency score benchmarked against similar Saudi buildings, giving the user an instant sense of where they stand.

4. **Financial Impact**: Precise estimates of annual energy waste, potential annual savings in SAR, and carbon reduction impact (measured in equivalent trees planted).

5. **Prioritized Action Plan**: Specific, actionable recommendations — each showing estimated annual savings, payback period in months, and implementation guidance — ranked by impact and ROI.

6. **AI Executive Summary**: A plain-language narrative written by the AI consultant explaining the findings and priorities.

7. **Interactive AI Chat**: An embedded chat interface where users ask follow-up questions about their specific building and get intelligent, context-aware answers.

8. **Persistent History**: Registered users retain their full assessment history to track energy improvement over time.

The system operates as a fully autonomous agent — no human consultant is involved at any stage.

---

### 5. How did you build it?

**Frontend:**
- React 19 + TypeScript + Vite (monorepo via pnpm workspaces)
- Tailwind CSS v4 with a custom Saudi brand design system (Poppins font, #006C35 primary green, #C89B3C gold)
- Framer Motion for premium animations and micro-interactions
- i18next for full Arabic/English bilingual support with RTL/LTR switching
- react-hook-form + Zod for validated multi-step assessment forms
- Recharts for energy cost breakdown and savings comparison visualizations

**Backend:**
- Node.js + Fastify API server
- PostgreSQL database via Drizzle ORM
- OpenAPI spec → auto-generated React Query hooks (type-safe API client)
- Guest token system: anonymous users get a UUID token stored in DB + localStorage, enabling assessment access without forced registration

**AI:**
- OpenAI GPT-4o for energy analysis computation, executive summary writing, and interactive chat
- Prompt engineering calibrated to Saudi building standards and SEC tariff structures

**Auth:**
- Supabase Auth with ES256 ECDSA JWT verification (fixed from default HS256)
- Google OAuth + email/password sign-in
- `optionalAuth` middleware: guests can use the full app; registered users get persistent history

**Challenges overcome:**
- Supabase recently migrated to ES256 (ECDSA P-256) tokens — required fetching the JWKS endpoint at startup and implementing asymmetric key verification instead of shared-secret HS256
- Building a real-time bilingual RTL/LTR experience that switches instantly without page reload required careful CSS logical properties and i18n integration
- Calibrating the AI's energy scoring model to Saudi-specific climate and tariff data required custom prompt engineering with domain knowledge

---

### 6. Who is this built for, and how does their life improve?

**Primary users:**

- **Saudi homeowners** receiving unexpectedly high electricity bills who want to understand why and what to do — without hiring a consultant. They get a clear score, specific fixes, and an estimated payback period within 60 seconds.

- **SME owners and commercial tenants** managing offices, retail shops, or warehouses who need to control operating costs but cannot justify a full energy audit. They get the same intelligence a certified auditor would provide, instantly and free.

- **Facility managers** overseeing multiple commercial properties who need a fast triage tool to identify which buildings need attention most urgently.

- **Corporate sustainability officers** tracking ESG metrics who need carbon reduction data and efficiency baselines across their portfolio.

**Real-world impact:** A typical Saudi commercial building scoring below 50 on EcoPilot Arabia's scale can expect recommendations that reduce their electricity bill by 20–40% annually — often SAR 15,000–60,000 per year — through measures like HVAC scheduling, LED retrofits, and insulation improvements with payback periods under 18 months.

---

### 7. Where do you want to take this tool next?

**Near-term:**
- Integration with the Saudi Electricity Company (SEC) smart meter API for automatic bill data import — eliminating manual input entirely
- IoT sensor integration for real-time monitoring and live efficiency tracking
- PDF report export for sharing with landlords, contractors, or banks

**Medium-term:**
- Multi-property portfolio dashboard for facility managers and real estate developers
- Automated monthly progress reports with trend analysis and achievement badges
- Expansion to full GCC coverage: UAE (DEWA standards), Kuwait (MEW), Qatar (KAHRAMAA) — each with localized tariff structures and benchmarks

**Long-term:**
- Carbon credit calculation and trading recommendations aligned with Saudi Arabia's Net Zero 2060 target
- Integration with Saudi Green Building Code for pre-construction compliance assessment
- White-label B2B version for energy consultancies, real estate developers, and government entities
- AI-powered contractor marketplace: match users to vetted contractors for the recommended upgrades, with ROI-guaranteed pricing

---

### 8. Searchability — Keywords

1. AI energy efficiency advisor Saudi Arabia
2. Agentic AI building energy audit
3. Energy cost reduction tool Saudi Arabia
4. HVAC optimization AI Saudi
5. Carbon footprint calculator Saudi Arabia
6. Smart building analytics AI
7. Saudi electricity bill reduction app
8. Energy efficiency score Saudi Vision 2030
9. Automated energy assessment AI
10. ESG compliance tool Saudi Arabia

---

### 9. Google Drive Link of Your Project Folder
**https://drive.google.com/drive/folders/1cPBpVl_a9k3yLKXsHRi3KczytiY6S6M7**

Folder contains:
- `Source Code/` — full source for energy-advisor (React frontend), api-server (Node.js backend), ecopilot-video (demo video app), and lib (shared library + OpenAPI spec + DB schema)
- `Assets/` — hackathon-submission.md (answers doc), hero image

---

### 10. Demo Video
EcoPilot Arabia — 90-second AI-narrated demo video
*(Generated video file — see ecopilot-video artifact)*

---

### 11. Hero Image
![EcoPilot Arabia Hero](attached_assets/hero-image.jpg)
*(Saved to: `attached_assets/hero-image.jpg`)*
