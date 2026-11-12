"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/components/auth-provider";
import { API_URL } from "@/lib/api";

const semesterColors: Record<string, string> = {
  ONE: "bg-pink-50 text-pink-700",
  TWO: "bg-orange-50 text-orange-700",
  THREE: "bg-yellow-50 text-yellow-700",
  FOUR: "bg-green-50 text-green-700",
  FIVE: "bg-teal-50 text-teal-700",
  SIX: "bg-blue-50 text-blue-700",
  SEVEN: "bg-violet-50 text-violet-700",
  EIGHT: "bg-purple-50 text-purple-700",
};

const courseColors = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
];

export default function StudentDashboard() {
  const { setUser } = useAuth();
  const [user, setUserData] = useState({ firstName: "", lastName: "", email: "", sap: null as number | null, semester: "", batchId: null as number | null });
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const token = () => localStorage.getItem("access_token");

  const getUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/student/me`, { headers: { Authorization: `Bearer ${token()}` } });
      setUserData(res.data);
      setUser(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_type");
        window.location.replace("/auth/signin");
      }
    } finally { setLoading(false); }
  };

  const getCourses = async () => {
    try {
      const res = await axios.get(`${API_URL}/student/classrooms`, { headers: { Authorization: `Bearer ${token()}` } });
      setCourses(res.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => {
    if (!localStorage.getItem("access_token")) { window.location.href = "/auth/signin"; return; }
    getUser();
    getCourses();
    window.history.pushState(null, '', window.location.href);
    const handlePop = () => { window.history.pushState(null, '', window.location.href); };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const totalSessions = courses.reduce((sum, c) => sum + (c.classroom?.sessions?.length || 0), 0);
  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-violet-600 text-white w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm">ACL</div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">AiCodeLab</span>
          </div>
          <div className="relative" ref={profileRef}>
            <button onClick={() => setShowProfile(p => !p)}
              className="flex items-center gap-2.5 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors border border-gray-100">
              <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 leading-none">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400 mt-0.5">Student</p>
              </div>
              <svg className={`h-4 w-4 text-gray-400 transition-transform ${showProfile ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                {/* Profile header */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-5 py-4 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-lg font-bold mb-2">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <p className="font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-violet-300 text-xs mt-0.5">{user.email}</p>
                </div>
                {/* Details */}
                <div className="px-5 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Role</span>
                    <span className="text-sm font-medium bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-full">Student</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">SAP ID</span>
                    <span className="text-sm font-medium text-gray-700">{user.sap}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Semester</span>
                    <span className="text-sm font-medium text-gray-700">{user.semester}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Batch</span>
                    <span className="text-sm font-medium text-gray-700">{user.batchId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Courses</span>
                    <span className="text-sm font-medium text-gray-700">{courses.length}</span>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <button onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user_type"); window.location.href = "/auth/signin"; }}
                    className="w-full py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors font-medium">
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute right-16 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative">
            <h1 className="text-2xl font-bold mb-1">Welcome back, {user.firstName}! 👋</h1>
            <p className="text-violet-200 text-sm">You're enrolled in {courses.length} course{courses.length !== 1 ? "s" : ""} with {totalSessions} session{totalSessions !== 1 ? "s" : ""} available.</p>
            <div className="flex gap-4 mt-4">
              <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                <p className="text-xl font-bold">{courses.length}</p>
                <p className="text-xs text-violet-200">Courses</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                <p className="text-xl font-bold">{totalSessions}</p>
                <p className="text-xs text-violet-200">Sessions</p>
              </div>
              {user.semester && (
                <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                  <p className="text-xl font-bold">{user.semester}</p>
                  <p className="text-xs text-violet-200">Semester</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Courses</h2>
          <span className="text-sm text-gray-400">{courses.length} enrolled</span>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-14 h-14 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-7 w-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No courses yet</p>
            <p className="text-gray-400 text-sm mt-1">Ask your faculty to add your batch to a class.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c, idx) => {
              const sessions = c.classroom?.sessions || [];
              const activeSessions = sessions.filter((s: any) => s.isActive && (!s.endTime || new Date(s.endTime) > new Date()));
              return (
                <Link key={c.classroomId} href={`/student/course/${c.classroomId}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
                  {/* Card header */}
                  <div className={`bg-gradient-to-br ${courseColors[idx % courseColors.length]} p-5 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-sm">
                        {getInitials(c.classroom?.course || "CX")}
                      </div>
                      {activeSessions.length > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mt-3">{c.classroom?.course}</h3>
                    <p className="text-white/70 text-xs mt-0.5">Batch {c.batchId}</p>
                  </div>
                  {/* Card body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${semesterColors[c.semester] || "bg-gray-100 text-gray-600"}`}>
                        Sem {c.semester}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">View sessions →</span>
                      <svg className="h-4 w-4 text-gray-300 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
