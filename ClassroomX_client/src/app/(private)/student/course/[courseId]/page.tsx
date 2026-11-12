"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { API_URL } from "@/lib/api";

interface TestCase {
  id: number; questionId: number; input: string; expectedOutput: string; isHidden: boolean;
}
interface Question {
  id: number; sessionId: number; title: string; description: string; score: number; testCases: TestCase[];
}
interface Submission {
  id: number; questionId: number; isSuccessful: boolean; score: number;
  question: { id: number; title: string; score: number };
}
interface Session {
  id: number; classroomId: number; title: string; description: string;
  startTime: string; endTime: string; isActive: boolean; totalScore: number;
  questions?: Question[]; submissions?: Submission[];
}
interface Course {
  id: number; course: string; semester: string; facultyID: number; sessions: Session[];
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const courseId = React.use(params).courseId;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());

  const getCourse = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) { window.location.href = "/auth/signin"; return; }
      const res = await axios.get(`${API_URL}/student/classroom/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(res.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { getCourse(); }, []);

  const toggleExpand = (id: number) => {
    const next = new Set(expandedSessions);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSessions(next);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const getStatus = (s: Session) => {
    const now = new Date();
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    if (!s.isActive) return { label: "Inactive", cls: "bg-gray-100 text-gray-500" };
    if (now < start) return { label: "Upcoming", cls: "bg-blue-50 text-blue-600" };
    if (now >= start && now <= end) return { label: "Live", cls: "bg-emerald-50 text-emerald-700", live: true };
    return { label: "Ended", cls: "bg-red-50 text-red-500" };
  };

  const isActive = (s: Session) => {
    const now = new Date();
    return s.isActive && now >= new Date(s.startTime) && now <= new Date(s.endTime);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
      <p className="text-gray-500">Course not found</p>
      <Link href="/student/dashboard" className="text-violet-600 hover:underline text-sm">Back to Dashboard</Link>
    </div>
  );

  const activeSessions = course.sessions.filter(s => isActive(s)).length;
  const upcoming = course.sessions.filter(s => {
    const now = new Date();
    return s.isActive && now < new Date(s.startTime);
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/student/dashboard"
            className="p-2 rounded-lg bg-violet-500 hover:bg-violet-400 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="bg-white text-violet-700 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm">ACL</div>
          <div>
            <h1 className="text-xl font-bold leading-none">{course.course}</h1>
            <p className="text-violet-300 text-xs mt-0.5">Semester {course.semester}</p>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-violet-600 pb-12 pt-2">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-violet-300 text-sm">Your sessions and progress for this course</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 pb-12 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-slide-up">
          {[
            { label: "Total Sessions", value: course.sessions.length, color: "text-violet-600 bg-violet-50", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: "Active Now", value: activeSessions, color: "text-emerald-600 bg-emerald-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Upcoming", value: upcoming, color: "text-blue-600 bg-blue-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up delay-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Sessions</h2>
            <span className="text-sm text-gray-400">{course.sessions.length} total</span>
          </div>

          {course.sessions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">No sessions yet</p>
              <p className="text-gray-400 text-xs mt-1">Your instructor hasn't created any sessions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {course.sessions.map((s, i) => {
                const status = getStatus(s);
                const hasSubmission = s.submissions && s.submissions.length > 0;
                const active = isActive(s);
                return (
                  <div key={s.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{s.title}</h3>
                            <span className={`flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${status.cls}`}>
                              {(status as any).live && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                              {status.label}
                            </span>
                          </div>
                          {s.description && (
                            <p className="text-xs text-gray-500 mb-2 truncate">{s.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {fmt(s.startTime)}, {fmtTime(s.startTime)} – {fmt(s.endTime)}, {fmtTime(s.endTime)}
                            </span>
                            {s.totalScore > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                {s.totalScore} pts
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          {hasSubmission ? (
                            <Link href={`/student/submission/${s.id}`}
                              className="px-3 py-1.5 text-xs font-medium text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
                              View Result
                            </Link>
                          ) : active ? (
                            <Link href={`/student/session/${s.id}`}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors shadow-sm">
                              Join Session
                            </Link>
                          ) : null}
                          {s.questions && s.questions.length > 0 && (
                            <button onClick={() => toggleExpand(s.id)}
                              className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all">
                              <svg className={`h-4 w-4 transition-transform duration-300 ${expandedSessions.has(s.id) ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedSessions.has(s.id) && s.questions && (
                      <div className="px-6 pb-5 animate-expand-down">
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Questions ({s.questions.length})</p>
                          <div className="space-y-2">
                            {s.questions.map((q, qi) => (
                              <div key={q.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-800">{qi + 1}. {q.title}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{q.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2 ml-3 shrink-0">
                                    <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">{q.score} pts</span>
                                    <span className="text-xs text-gray-400">{q.testCases.length} tests</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
