"use client";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";

const features = [
  "Interactive live coding sessions",
  "Real-time student progress tracking",
  "Collaborative classroom tools",
];

const content = {
  faculty: {
    tag: "For Educators",
    heading: "Transform Your Teaching Experience",
    sub: "Join thousands of educators enhancing student engagement and learning outcomes with our innovative platform.",
  },
  student: {
    tag: "For Students",
    heading: "Unlock Your Learning Potential",
    sub: "Access live coding sessions, track your progress, and compete with peers on the AiCodeLab platform.",
  },
};

export default function SignIn() {
  const router = useRouter();
  const [userType, setUserType] = useState<"faculty" | "student">("faculty");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isStudent = userType === "student";
  const c = content[userType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${API_URL}/auth/signin/${userType}`,
        { email, password }
      );
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_type", userType);
      router.replace(isStudent ? "/student/dashboard" : "/faculty/dashboard");
    } catch (err: unknown) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.message || err.message) : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col text-white p-10 justify-between relative overflow-hidden">

        {/* Faculty gradient — always rendered, fades out when student */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: isStudent ? 0 : 1,
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 40%, #3730a3 100%)" }}
        />

        {/* Student gradient — fades in when student */}
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: isStudent ? 1 : 0,
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #86198f 100%)" }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 transition-opacity duration-700" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 transition-opacity duration-700" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-md"
              style={{ color: isStudent ? "#7c3aed" : "#2563eb",
                transition: "color 0.7s ease" }}>
              X
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AiCodeLab</h1>
          </div>

          <div className="max-w-sm">
            {/* Tag — crossfade */}
            <div className="relative h-7 mb-4 overflow-hidden">
              <span
                className="absolute inset-0 flex items-center transition-all duration-500 ease-in-out"
                style={{ opacity: isStudent ? 0 : 1, transform: isStudent ? "translateY(-8px)" : "translateY(0)" }}>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-100 uppercase tracking-wide">
                  For Educators
                </span>
              </span>
              <span
                className="absolute inset-0 flex items-center transition-all duration-500 ease-in-out"
                style={{ opacity: isStudent ? 1 : 0, transform: isStudent ? "translateY(0)" : "translateY(8px)" }}>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/20 text-violet-100 uppercase tracking-wide">
                  For Students
                </span>
              </span>
            </div>

            {/* Heading — crossfade */}
            <div className="relative h-28 mb-5 overflow-hidden">
              <h2
                className="absolute text-4xl font-bold leading-snug transition-all duration-500 ease-in-out"
                style={{ opacity: isStudent ? 0 : 1, transform: isStudent ? "translateY(-12px)" : "translateY(0)" }}>
                Transform Your Teaching Experience
              </h2>
              <h2
                className="absolute text-4xl font-bold leading-snug transition-all duration-500 ease-in-out"
                style={{ opacity: isStudent ? 1 : 0, transform: isStudent ? "translateY(0)" : "translateY(12px)" }}>
                Unlock Your Learning Potential
              </h2>
            </div>

            {/* Sub — crossfade */}
            <div className="relative h-20 overflow-hidden">
              <p
                className="absolute text-base text-blue-100 leading-relaxed transition-all duration-500 ease-in-out"
                style={{ opacity: isStudent ? 0 : 1, transform: isStudent ? "translateY(-8px)" : "translateY(0)" }}>
                Join thousands of educators enhancing student engagement and learning outcomes with our innovative platform.
              </p>
              <p
                className="absolute text-base text-violet-100 leading-relaxed transition-all duration-500 ease-in-out"
                style={{ opacity: isStudent ? 1 : 0, transform: isStudent ? "translateY(0)" : "translateY(8px)" }}>
                Access live coding sessions, track your progress, and compete with peers on the AiCodeLab platform.
              </p>
            </div>
          </div>
        </div>

        {/* Features list */}
        <div className="relative z-10 space-y-5">
          {features.map((item) => (
            <div key={item} className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-2 shrink-0">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-white/80">{item}</p>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-xs text-white/40 mt-10">
          © {new Date().getFullYear()} AiCodeLab. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex justify-center items-center p-6 bg-gray-50 min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500">Sign in to access your AiCodeLab account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <div className="relative grid grid-cols-2 gap-0 p-1 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Sliding pill */}
                  <div
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm transition-all duration-300 ease-in-out"
                    style={{ left: isStudent ? "calc(50% + 2px)" : "4px" }}
                  />
                  {(["faculty", "student"] as const).map((role) => (
                    <button key={role} type="button" onClick={() => setUserType(role)}
                      className={`relative z-10 py-2 text-sm font-medium capitalize transition-colors duration-300 ${
                        userType === role ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                      }`}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input type="email" required placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <input type="password" required placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-lg animate-fade-in">{error}</div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full py-2.5 px-4 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: isStudent
                    ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                    : "linear-gradient(135deg,#2563eb,#1d4ed8)",
                }}>
                {isLoading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                )}
                {isLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
