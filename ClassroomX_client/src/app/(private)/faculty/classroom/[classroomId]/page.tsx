"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { API_URL } from "@/lib/api";

interface TestCase {
  id: number;
  questionId: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface Question {
  id: number;
  sessionId: number;
  title: string;
  description: string;
  score: number;
  testCases: TestCase[];
}

interface Session {
  id: number;
  classroomId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  totalScore: number;
  showResultsImmediately: boolean;
  questions: Question[];
  _count: { students: number; submissions: number };
}

interface Batch {
  classroomId: number;
  batchId: number;
  semester: string;
}

interface Classroom {
  id: number;
  course: string;
  semester: string;
  facultyID: number;
  batches: Batch[];
  sessions: Session[];
}

export default function ClassroomDetailPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const classroomId = React.use(params).classroomId;
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());
  const [togglingSession, setTogglingSession] = useState<number | null>(null);

  const getClassroom = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) { window.location.href = "/auth/signin"; return; }
      const res = await axios.get(`${API_URL}/faculty/classroom/${classroomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClassroom(res.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const toggleShowResults = async (sessionId: number) => {
    try {
      setTogglingSession(sessionId);
      const token = localStorage.getItem("access_token");
      const res = await axios.patch(
        `${API_URL}/faculty/session/${sessionId}/toggle-results`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClassroom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sessions: prev.sessions.map((s) =>
            s.id === sessionId ? { ...s, showResultsImmediately: res.data.showResultsImmediately } : s
          ),
        };
      });
    } catch (e) { console.log(e); }
    finally { setTogglingSession(null); }
  };

  useEffect(() => { getClassroom(); }, []);

  const deleteSession = async (sessionId: number) => {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_URL}/faculty/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClassroom((prev) => {
        if (!prev) return prev;
        return { ...prev, sessions: prev.sessions.filter((s) => s.id !== sessionId) };
      });
    } catch (e) { console.log(e); }
  };

  const toggleExpand = (id: number) => {
    const next = new Set(expandedSessions);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSessions(next);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!classroom) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
      <p className="text-gray-500">Classroom not found</p>
      <Link href="/faculty/dashboard" className="text-indigo-600 hover:underline text-sm">Back to Dashboard</Link>
    </div>
  );

  const isSessionActive = (s: { isActive: boolean; endTime: string }) =>
    s.isActive && (!s.endTime || new Date(s.endTime) > new Date());
  const activeSessions = classroom.sessions.filter(isSessionActive).length;
  const totalQuestions = classroom.sessions.reduce((a, s) => a + s.questions.length, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/faculty/dashboard"
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="bg-white text-indigo-700 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm">ACL</div>
          <div>
            <h1 className="text-xl font-bold leading-none">{classroom.course}</h1>
            <p className="text-indigo-300 text-xs mt-0.5">
              Semester {classroom.semester} · Batches: {classroom.batches.map(b => b.batchId).join(", ")}
            </p>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-indigo-700 pb-12 pt-2">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-indigo-300 text-sm">Classroom overview and session management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-6 animate-slide-up">
          {[
            { label: "Total Sessions", value: classroom.sessions.length, color: "text-indigo-600 bg-indigo-50", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: "Active Sessions", value: activeSessions, color: "text-emerald-600 bg-emerald-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Total Questions", value: totalQuestions, color: "text-violet-600 bg-violet-50", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
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

        {/* Sessions list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 animate-slide-up delay-100">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Sessions</h2>
            <Link href={`/faculty/classroom/${classroomId}/createSession`}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Session
            </Link>
          </div>

          {classroom.sessions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">No sessions yet</p>
              <p className="text-gray-400 text-xs mt-1">Create your first session to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {classroom.sessions.map((session, i) => (
                <div key={session.id} className="group animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{session.title}</h3>
                          {isSessionActive(session) ? (
                            <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-medium">Ended</span>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-sm text-gray-500 mb-2 truncate">{session.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {fmt(session.startTime)}, {fmtTime(session.startTime)} – {fmt(session.endTime)}, {fmtTime(session.endTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {session.questions.length} question{session.questions.length !== 1 ? "s" : ""}
                          </span>
                          {session._count && (
                            <span className="flex items-center gap-1">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {session._count.submissions} submission{session._count.submissions !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        {/* Show results toggle */}
                        <button
                          onClick={() => toggleShowResults(session.id)}
                          disabled={togglingSession === session.id}
                          title={session.showResultsImmediately ? "Hide results until session ends" : "Show results immediately"}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            session.showResultsImmediately
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          } ${togglingSession === session.id ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span className={`relative inline-flex w-7 h-4 rounded-full transition-colors flex-shrink-0 ${
                            session.showResultsImmediately ? "bg-emerald-500" : "bg-gray-300"
                          }`}>
                            <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                              session.showResultsImmediately ? "translate-x-3.5" : "translate-x-0.5"
                            }`} />
                          </span>
                          Show results
                        </button>
                        <Link href={`/faculty/classroom/${classroomId}/session/${session.id}/submissions`}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                          View Submissions
                        </Link>
                        <button onClick={() => deleteSession(session.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete session">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button onClick={() => toggleExpand(session.id)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <svg className={`h-4 w-4 transition-transform duration-300 ${expandedSessions.has(session.id) ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedSessions.has(session.id) && (
                    <div className="px-6 pb-5 animate-expand-down">
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Questions</p>
                        {session.questions.length === 0 ? (
                          <p className="text-sm text-gray-400">No questions in this session</p>
                        ) : (
                          <div className="space-y-2">
                            {session.questions.map((q, idx) => (
                              <div key={q.id} className="bg-slate-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-800">{idx + 1}. {q.title}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{q.description}</p>
                                  </div>
                                  <div className="flex items-center gap-3 ml-4 shrink-0">
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{q.score} pts</span>
                                    <span className="text-xs text-gray-400">{q.testCases.length} tests</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
