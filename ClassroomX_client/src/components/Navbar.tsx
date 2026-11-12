"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

const features = [
  {
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    color: "bg-indigo-50 text-indigo-600",
    title: "Live Coding Sessions",
    desc: "Real-time coding environment with Monaco Editor, supporting JS, Python & C",
  },
  {
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    color: "bg-emerald-50 text-emerald-600",
    title: "Auto-graded Submissions",
    desc: "Instant evaluation against visible & hidden test cases with score calculation",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    color: "bg-violet-50 text-violet-600",
    title: "Progress Analytics",
    desc: "Faculty dashboards showing completion rates, average scores & per-question stats",
  },
  {
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: "bg-amber-50 text-amber-600",
    title: "AI Question Generator",
    desc: "Describe a topic and let AI generate complete coding questions with test cases instantly",
  },
  {
    icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    color: "bg-blue-50 text-blue-600",
    title: "Question Bank",
    desc: "Save AI-generated or custom questions and reuse them across any session",
  },
  {
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    color: "bg-rose-50 text-rose-600",
    title: "Academic Proctoring",
    desc: "Tab switches and focus losses are automatically logged per student for integrity monitoring",
  },
];

export default function Navbar() {
  const [showFeatures, setShowFeatures] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowFeatures(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowFeatures(false), 120);
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
            X
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            AiCodeLab
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {/* Features dropdown */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showFeatures ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Features
              <svg
                className={`h-3.5 w-3.5 transition-transform duration-200 ${showFeatures ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFeatures && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[560px] bg-white rounded-2xl shadow-xl border border-gray-100 p-5 animate-scale-in"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 px-1">Platform Features</p>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((f) => (
                    <div key={f.title}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-default group">
                      <div className={`p-2 rounded-lg shrink-0 ${f.color} group-hover:scale-105 transition-transform`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-none mb-1">{f.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Built for educators & students</p>
                  <Link href="/auth/signup"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                    Get started free
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <a href="#how-it-works"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
            How it works
          </a>
          <a href="#for-who"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
            For who
          </a>
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <Link href="/auth/signin"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
            Sign In
          </Link>
          <Link href="/auth/signup"
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
            Sign Up Free
          </Link>
        </div>
      </div>
    </header>
  );
}
