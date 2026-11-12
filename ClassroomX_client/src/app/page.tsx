"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    gradient: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    color: "text-indigo-600",
    title: "Live Coding Environment",
    desc: "Students write, run and submit code directly in the browser using Monaco Editor — the same engine that powers VS Code.",
    bullets: ["JavaScript, Python & C support", "Syntax highlighting & autocomplete", "Real-time code execution via Piston API"],
  },
  {
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    title: "Auto-graded Submissions",
    desc: "Every submission is automatically evaluated against visible and hidden test cases, giving instant, objective scores.",
    bullets: ["Hidden test cases prevent gaming", "Per-question scoring", "Pass/fail breakdown for faculty"],
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    color: "text-violet-600",
    title: "Progress Analytics",
    desc: "Detailed dashboards show faculty exactly how each student is performing — by question, by session, and over time.",
    bullets: ["Average score & completion rate", "Search, filter & sort submissions", "Student-level drill-down"],
  },
  {
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "AI Question Generator",
    desc: "Describe a topic and let AI instantly generate complete coding or MCQ questions — with test cases, constraints, and sample I/O.",
    bullets: ["Generate from a plain-English prompt", "Coding & MCQ question types", "Save to reusable question bank"],
  },
  {
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    color: "text-rose-600",
    title: "Classroom & Question Bank",
    desc: "Organise courses by semester and batch. Build a reusable question bank and pull questions directly into any session.",
    bullets: ["Multi-batch classroom support", "Save & reuse questions across sessions", "Per-classroom session history"],
  },
  {
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    gradient: "from-slate-600 to-gray-700",
    bg: "bg-slate-50",
    color: "text-slate-600",
    title: "Academic Integrity & Proctoring",
    desc: "Every session is passively monitored. Tab switches and focus losses are logged per student so faculty can spot suspicious behaviour.",
    bullets: ["Automatic tab-switch detection", "Per-student proctor log timeline", "Visible to faculty after session ends"],
  },
];

const steps = [
  { num: "01", title: "Faculty creates a classroom", desc: "Set up a course with semester and batch details. Invite student batches in one click." },
  { num: "02", title: "Design a coding session", desc: "Use AI to generate questions or pick from your question bank. Add test cases, scoring, and a time window." },
  { num: "03", title: "Students join & code", desc: "Students open the session, read the problem, write code in the browser and hit Run to test against examples." },
  { num: "04", title: "Results, analytics & proctoring", desc: "Submissions are auto-graded. Faculty see scores, completion rates, code diffs and per-student proctor logs." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/60 pt-20 pb-28">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-violet-200/30 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Built for real classrooms · Powered by live code execution
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 animate-slide-up">
            Where Code Meets{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
              the Classroom
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up delay-75">
            AiCodeLab lets faculty run live coding sessions with auto-grading, hidden test cases, and real-time analytics — all inside a beautiful browser-based IDE.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-150">
            <Link href="/auth/signup"
              className="px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
              Start for free →
            </Link>
            <Link href="/auth/signin"
              className="px-8 py-3.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all duration-200">
              Sign in to your account
            </Link>
          </div>

          {/* Stat strip */}
          <div className="mt-16 grid grid-cols-4 gap-6 max-w-xl mx-auto animate-slide-up delay-200">
            {[["Live IDE", "Monaco-powered"], ["3 Languages", "JS · Python · C"], ["Auto-graded", "Hidden test cases"], ["AI-powered", "Question generation"]].map(([v, l]) => (
              <div key={v} className="text-center">
                <p className="text-lg font-bold text-gray-900">{v}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Everything you need</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">A complete platform, not just a tool</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From session creation to final grading — AiCodeLab handles the full lifecycle of a live coding classroom.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`w-11 h-11 ${f.bg} ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{f.desc}</p>
                <ul className="space-y-1.5">
                  {f.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className={`h-3.5 w-3.5 shrink-0 ${f.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For who ────────────────────────────────── */}
      <section id="for-who" className="py-24 bg-gradient-to-br from-slate-50 to-indigo-50/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Two portals, one platform</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2">Designed for both sides of the classroom</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Faculty */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-md">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">For Educators</span>
              <h3 className="text-2xl font-bold text-gray-900 mt-1 mb-3">Run smarter coding classes</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Build classrooms, schedule timed sessions with custom questions and test cases, then monitor every student's performance from a single dashboard.
              </p>
              <ul className="space-y-3 mb-8">
                {["Create classrooms with multi-batch support", "AI-generate questions or build from scratch", "Question bank for reuse across sessions", "Live submission feed with scores & proctor logs"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                      <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl hover:from-indigo-700 hover:to-blue-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5">
                Join as Faculty
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Student */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-md">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-violet-600 uppercase tracking-widest">For Students</span>
              <h3 className="text-2xl font-bold text-gray-900 mt-1 mb-3">Practice & prove your skills</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Join live sessions, solve problems in a real IDE, get instant feedback on your test cases, and track your progress across all courses.
              </p>
              <ul className="space-y-3 mb-8">
                {["Browser-based Monaco Editor", "Run code against visible test cases", "Instant pass/fail result per test", "View submission history & scores"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-violet-50 rounded-full flex items-center justify-center shrink-0">
                      <svg className="h-3 w-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-700 hover:to-purple-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5">
                Join as Student
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Simple by design</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">Up and running in minutes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From classroom setup to a graded session — the whole flow is four steps.</p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((s, i) => (
                <div key={s.num} className="text-center animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-black text-xl shadow-lg mb-4">
                    {s.num}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 left-0 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to transform your classroom?</h2>
          <p className="text-indigo-200 mb-8 text-lg">Sign up for free. No credit card required. Start running live coding sessions today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup"
              className="px-8 py-3.5 text-sm font-semibold text-indigo-700 bg-white hover:bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
              Create your account →
            </Link>
            <Link href="/auth/signin"
              className="px-8 py-3.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-200">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">ACL</div>
            <span className="text-sm font-bold text-gray-700">AiCodeLab</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/auth/signin" className="hover:text-indigo-600 transition-colors">Sign In</Link>
            <span className="text-gray-200">|</span>
            <Link href="/auth/signup" className="hover:text-indigo-600 transition-colors">Sign Up</Link>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: "Twitter", d: "M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" },
              { label: "GitHub", d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" },
              { label: "LinkedIn", d: "M5.3 8.3h2.9v11.4H5.3V8.3zm1.4-4.5c.9 0 1.7.8 1.7 1.7s-.8 1.7-1.7 1.7-1.7-.8-1.7-1.7.8-1.7 1.7-1.7m3.5 4.5h2.8v1.3c.4-.8 1.4-1.5 2.8-1.5 3 0 3.6 2 3.6 4.5v7.1h-2.9v-6.3c0-1.2 0-2.6-1.6-2.6s-1.9 1.3-1.9 2.5v6.4h-2.9V8.3z" },
            ].map(s => (
              <a key={s.label} href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <span className="sr-only">{s.label}</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule={s.label === "GitHub" || s.label === "LinkedIn" ? "evenodd" : undefined}
                    clipRule={s.label === "GitHub" || s.label === "LinkedIn" ? "evenodd" : undefined}
                    d={s.d} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
