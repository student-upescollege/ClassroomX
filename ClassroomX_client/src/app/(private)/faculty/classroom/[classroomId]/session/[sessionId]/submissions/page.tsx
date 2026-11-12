"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { API_URL } from "@/lib/api";

interface Student { sap: number; firstName: string; lastName: string; email: string }
interface Question { id: number; title: string; score: number }
interface CodeSubmission {
  id: number; createdAt: string; sessionId: number; studentId: number; questionId: number;
  code: string; language: string; output: string | null; error: string | null;
  isSuccessful: boolean; score: number; student: Student; question: Question;
}
interface SessionData {
  id: number; title: string; description: string; startTime: string;
  endTime: string; totalScore: number; isActive: boolean; questions: Question[];
}
interface StudentSummary {
  student: Student; submissions: CodeSubmission[]; totalScore: number;
  maxPossibleScore: number; questionsAttempted: number; totalQuestions: number; completionRate: number;
  hasSubmitted: boolean;
}
interface ProctorEntry { timestamp: string; content: string | null }
interface ProctorEvent { type: string; entries: ProctorEntry[] }
interface ProctorStudentLog {
  sap: number; firstName: string; lastName: string;
  totalViolations: number; events: ProctorEvent[];
}

const EVENT_META: Record<string, { label: string; color: string; icon: string }> = {
  TAB_SWITCH:        { label: "Tab Switch",              color: "bg-red-100 text-red-700 border-red-200", icon: "⇥" },
  COPY:              { label: "Copy",                    color: "bg-amber-100 text-amber-700 border-amber-200", icon: "📋" },
  PASTE:             { label: "Paste",                   color: "bg-orange-100 text-orange-700 border-orange-200", icon: "📥" },
  CUT:               { label: "Cut",                     color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "✂️" },
  WINDOW_BLUR:       { label: "Window / DevTools Blur",  color: "bg-rose-100 text-rose-700 border-rose-200", icon: "👁️" },
  NO_FACE_DETECTED:  { label: "No Face Detected",        color: "bg-red-200 text-red-800 border-red-300", icon: "👤❌" },
  MULTIPLE_FACES:    { label: "Multiple People in Frame",color: "bg-purple-100 text-purple-700 border-purple-200", icon: "👥" },
  VOICE_DETECTED:    { label: "Voice / Speech Detected", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: "🎙️" },
  FULLSCREEN_EXIT:   { label: "Fullscreen Exited",       color: "bg-red-200 text-red-900 border-red-400 font-bold", icon: "⛶❌" },
};

// Helper: Parse content string to extract text reason and optional base64 snapshot
function parseProctorContent(content: string | null): { reason: string; snapshot: string | null } {
  if (!content) return { reason: "Violation recorded", snapshot: null };
  try {
    if (content.startsWith("{") && content.includes('"snapshot"')) {
      const parsed = JSON.parse(content);
      return { reason: parsed.reason || "Violation recorded", snapshot: parsed.snapshot || null };
    }
  } catch {}
  return { reason: content, snapshot: null };
}

export default function SessionSubmissionsPage({ params }: { params: Promise<{ classroomId: string; sessionId: string }> }) {
  const { classroomId, sessionId } = React.use(params);
  const [session, setSession] = useState<SessionData | null>(null);
  const [studentSubs, setStudentSubs] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  const [expandedCode, setExpandedCode] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [threatFilter, setThreatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [proctorLogs, setProctorLogs] = useState<ProctorStudentLog[]>([]);

  // Live Auto-Refresh State
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Evidence Snapshot Modal
  const [evidenceModal, setEvidenceModal] = useState<{
    studentName: string;
    sap: number;
    type: string;
    timestamp: string;
    reason: string;
    snapshot: string;
  } | null>(null);

  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) { window.location.href = "/auth/signin"; return; }
      const [subsRes, proctorRes] = await Promise.all([
        axios.get(`${API_URL}/faculty/session/${sessionId}/submissions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/faculty/session/${sessionId}/proctor-logs`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setSession(subsRes.data.session);
      processStudents(subsRes.data.submissions, subsRes.data.session.questions, subsRes.data.allStudents ?? []);
      setProctorLogs(proctorRes.data);
      setLastUpdated(new Date());
    } catch (e) {
      console.log(e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Live Auto-Polling every 6 seconds when enabled
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchData(true);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [sessionId, autoRefresh]);

  const processStudents = (subs: CodeSubmission[], questions: Question[], allStudents: Student[]) => {
    const maxPossibleScore = questions.reduce((s, q) => s + q.score, 0);
    const map = new Map<number, StudentSummary>();

    // Seed map with all enrolled students
    allStudents.forEach(student => {
      map.set(student.sap, {
        student, submissions: [], totalScore: 0,
        maxPossibleScore, questionsAttempted: 0,
        totalQuestions: questions.length, completionRate: 0, hasSubmitted: false,
      });
    });

    // Overlay actual submissions
    subs.forEach(sub => {
      if (!map.has(sub.studentId)) {
        map.set(sub.studentId, {
          student: sub.student, submissions: [], totalScore: 0,
          maxPossibleScore, questionsAttempted: 0,
          totalQuestions: questions.length, completionRate: 0, hasSubmitted: true,
        });
      }
      const d = map.get(sub.studentId)!;
      d.hasSubmitted = true;
      d.submissions.push(sub);
      d.totalScore += sub.score;
      d.questionsAttempted = d.submissions.length;
      d.completionRate = (d.questionsAttempted / d.totalQuestions) * 100;
    });
    setStudentSubs(Array.from(map.values()));
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const filtered = () => {
    let list = [...studentSubs];

    // Search
    if (searchQuery) list = list.filter(s =>
      `${s.student.firstName} ${s.student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student.sap.toString().includes(searchQuery)
    );

    // Status filter
    if (filterStatus === "completed") list = list.filter(s => s.completionRate === 100);
    else if (filterStatus === "in-progress") list = list.filter(s => s.completionRate > 0 && s.completionRate < 100);
    else if (filterStatus === "not-started") list = list.filter(s => s.completionRate === 0);

    // Threat level filter
    if (threatFilter === "violations-only") {
      list = list.filter(s => {
        const plog = proctorLogs.find(l => l.sap === s.student.sap);
        return (plog?.totalViolations ?? 0) > 0;
      });
    } else if (threatFilter === "critical-only") {
      list = list.filter(s => {
        const plog = proctorLogs.find(l => l.sap === s.student.sap);
        return (plog?.totalViolations ?? 0) >= 5;
      });
    } else if (threatFilter === "clean-only") {
      list = list.filter(s => {
        const plog = proctorLogs.find(l => l.sap === s.student.sap);
        return (plog?.totalViolations ?? 0) === 0;
      });
    }

    // Sort
    if (sortBy === "score-desc") list.sort((a, b) => b.totalScore - a.totalScore);
    else if (sortBy === "score-asc") list.sort((a, b) => a.totalScore - b.totalScore);
    else if (sortBy === "violations-desc") {
      list.sort((a, b) => {
        const vA = proctorLogs.find(l => l.sap === a.student.sap)?.totalViolations ?? 0;
        const vB = proctorLogs.find(l => l.sap === b.student.sap)?.totalViolations ?? 0;
        return vB - vA;
      });
    } else if (sortBy === "completion-desc") list.sort((a, b) => b.completionRate - a.completionRate);
    else if (sortBy === "name-asc") list.sort((a, b) => `${a.student.firstName} ${a.student.lastName}`.localeCompare(`${b.student.firstName} ${b.student.lastName}`));
    return list;
  };

  // Threat Statistics across all enrolled students
  const threatStats = {
    clean: studentSubs.filter(s => (proctorLogs.find(l => l.sap === s.student.sap)?.totalViolations ?? 0) === 0).length,
    minor: studentSubs.filter(s => {
      const v = proctorLogs.find(l => l.sap === s.student.sap)?.totalViolations ?? 0;
      return v >= 1 && v <= 2;
    }).length,
    highRisk: studentSubs.filter(s => {
      const v = proctorLogs.find(l => l.sap === s.student.sap)?.totalViolations ?? 0;
      return v >= 3 && v < 5;
    }).length,
    terminated: studentSubs.filter(s => (proctorLogs.find(l => l.sap === s.student.sap)?.totalViolations ?? 0) >= 5).length,
  };

  const stats = {
    total: studentSubs.length,
    avg: studentSubs.length ? studentSubs.reduce((s, x) => s + x.totalScore, 0) / studentSubs.length : 0,
    avgCompletion: studentSubs.length ? studentSubs.reduce((s, x) => s + x.completionRate, 0) / studentSubs.length : 0,
    questions: session?.questions.length || 0,
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
      <p className="text-gray-500">Session not found</p>
      <Link href={`/faculty/classroom/${classroomId}`} className="text-indigo-600 hover:underline text-sm">Back to Classroom</Link>
    </div>
  );

  const rows = filtered();

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Evidence Snapshot Lightbox Modal */}
      {evidenceModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-white">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-bold text-sm">📸 Incident Evidence Snapshot</span>
              </div>
              <button
                onClick={() => setEvidenceModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-5 flex flex-col items-center">
              <img
                src={evidenceModal.snapshot}
                alt="Webcam proctoring snapshot"
                className="w-full max-h-80 object-contain rounded-xl border-2 border-red-500/80 shadow-lg bg-black"
              />
              <div className="w-full mt-4 bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-semibold text-slate-200">{evidenceModal.studentName} (SAP {evidenceModal.sap})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Violation Type:</span>
                  <span className="font-bold text-red-400">{EVENT_META[evidenceModal.type]?.label ?? evidenceModal.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recorded Timestamp:</span>
                  <span className="font-mono text-slate-300">{fmtTime(evidenceModal.timestamp)}</span>
                </div>
                <div className="border-t border-slate-700 pt-1.5 text-amber-200">
                  {evidenceModal.reason}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setEvidenceModal(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
              >
                Close Evidence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/faculty/classroom/${classroomId}`}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="bg-white text-indigo-700 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm">ACL</div>
            <div>
              <h1 className="text-xl font-bold leading-none">{session.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-indigo-300 text-xs">{fmt(session.startTime)}</p>
                {session.isActive && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Active Assessment
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Live Auto-Refresh Controller */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                autoRefresh
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-500"
                  : "bg-indigo-800 text-indigo-300 border-indigo-600 hover:bg-indigo-600"
              }`}
              title="Toggle Live 6-second proctoring update polling"
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-400 animate-ping" : "bg-gray-400"}`} />
              {autoRefresh ? "Live Feed: ON" : "Live Feed: Paused"}
            </button>
            <button
              onClick={() => fetchData(true)}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition text-xs flex items-center gap-1"
              title="Manually refresh data now"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="bg-indigo-700 pb-12" />

      <div className="max-w-7xl mx-auto px-6 -mt-8 space-y-6">
        {/* Live Proctoring Threat Level Dashboard Banner */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Proctoring & Malpractice Telemetry Overview
            </h3>
            <span className="text-[11px] text-gray-400">
              Updated: {fmtTime(lastUpdated.toISOString())}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              onClick={() => setThreatFilter(threatFilter === "clean-only" ? "all" : "clean-only")}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                threatFilter === "clean-only" ? "ring-2 ring-emerald-500 bg-emerald-50/70" : "bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50"
              }`}
            >
              <div className="flex justify-between items-center text-xs text-emerald-800 font-semibold mb-1">
                <span>🟢 Clean Integrity</span>
                <span className="text-emerald-600 font-bold">{threatStats.clean}</span>
              </div>
              <p className="text-[11px] text-emerald-700">0 violations recorded</p>
            </div>

            <div
              onClick={() => setThreatFilter(threatFilter === "violations-only" ? "all" : "violations-only")}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                threatFilter === "violations-only" ? "ring-2 ring-amber-500 bg-amber-50/70" : "bg-amber-50/40 border-amber-100 hover:bg-amber-50"
              }`}
            >
              <div className="flex justify-between items-center text-xs text-amber-800 font-semibold mb-1">
                <span>🟡 Minor Flagged</span>
                <span className="text-amber-600 font-bold">{threatStats.minor}</span>
              </div>
              <p className="text-[11px] text-amber-700">1 to 2 strikes</p>
            </div>

            <div
              onClick={() => setThreatFilter(threatFilter === "violations-only" ? "all" : "violations-only")}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                threatFilter === "violations-only" ? "ring-2 ring-orange-500 bg-orange-50/70" : "bg-orange-50/40 border-orange-100 hover:bg-orange-50"
              }`}
            >
              <div className="flex justify-between items-center text-xs text-orange-800 font-semibold mb-1">
                <span>🟠 High Risk</span>
                <span className="text-orange-600 font-bold">{threatStats.highRisk}</span>
              </div>
              <p className="text-[11px] text-orange-700">3 to 4 strikes (Near lockout)</p>
            </div>

            <div
              onClick={() => setThreatFilter(threatFilter === "critical-only" ? "all" : "critical-only")}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                threatFilter === "critical-only" ? "ring-2 ring-red-500 bg-red-50/70" : "bg-red-50/40 border-red-100 hover:bg-red-50"
              }`}
            >
              <div className="flex justify-between items-center text-xs text-red-800 font-semibold mb-1">
                <span>⛔ Terminated (5 Strikes)</span>
                <span className="text-red-600 font-bold">{threatStats.terminated}</span>
              </div>
              <p className="text-[11px] text-red-700">Auto-submitted by AI Proctor</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Search Student</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Name or SAP ID..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Submission Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="all">All Submissions</option>
                <option value="completed">Completed (100%)</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Proctoring Threat</label>
              <select
                value={threatFilter}
                onChange={e => setThreatFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                <option value="all">All Students</option>
                <option value="violations-only">Flagged Violations Only</option>
                <option value="critical-only">Critical / Auto-Terminated (5 strikes)</option>
                <option value="clean-only">Clean Only (0 violations)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="violations-desc">Most Violations First</option>
                <option value="score-desc">Score (High → Low)</option>
                <option value="score-asc">Score (Low → High)</option>
                <option value="completion-desc">Questions Attempted</option>
                <option value="name-asc">Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Submissions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Student Examination & Audit Roster</h3>
            <span className="text-sm text-gray-400">{rows.length} student{rows.length !== 1 ? "s" : ""}</span>
          </div>

          {rows.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400 text-sm">No students match current filter criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {rows.map((s, i) => {
                const plog = proctorLogs.find(l => l.sap === s.student.sap);
                const violations = plog?.totalViolations ?? 0;

                // Determine threat badge styling
                const threatConfig =
                  violations >= 5
                    ? { label: "Terminated (5 Strikes)", style: "bg-red-600 text-white animate-pulse" }
                    : violations >= 3
                    ? { label: `${violations} Strikes (High Risk)`, style: "bg-orange-100 text-orange-800 border border-orange-300" }
                    : violations >= 1
                    ? { label: `${violations} Violation${violations > 1 ? "s" : ""}`, style: "bg-amber-100 text-amber-800 border border-amber-300" }
                    : { label: "Clean Record", style: "bg-emerald-50 text-emerald-700 border border-emerald-200" };

                const canExpand = s.hasSubmitted || violations > 0;
                return (
                  <div key={s.student.sap} className="transition-colors">
                    <div className="px-6 py-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                            violations >= 5 ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700"
                          }`}>
                            {s.student.firstName[0]}{s.student.lastName[0]}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {s.student.firstName} {s.student.lastName}
                              </h4>
                              <span className="text-xs text-gray-400">SAP: {s.student.sap}</span>

                              {/* Proctoring Threat Level Badge */}
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${threatConfig.style}`}>
                                🛡️ {threatConfig.label}
                              </span>

                              {!s.hasSubmitted && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                                  Not submitted
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                              {s.hasSubmitted ? (
                                <>
                                  <span className={`font-bold text-sm ${
                                    s.maxPossibleScore > 0 && (s.totalScore / s.maxPossibleScore) >= 0.75 ? "text-emerald-600" :
                                    s.maxPossibleScore > 0 && (s.totalScore / s.maxPossibleScore) >= 0.4 ? "text-amber-600" : "text-red-500"
                                  }`}>
                                    {s.totalScore}<span className="text-gray-400 font-normal">/{s.maxPossibleScore}</span>
                                  </span>
                                  <span>Questions: <strong className="text-gray-800">{s.questionsAttempted}/{s.totalQuestions}</strong></span>
                                  <span className="text-gray-400">
                                    {s.maxPossibleScore > 0 ? ((s.totalScore / s.maxPossibleScore) * 100).toFixed(0) : 0}% marks
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-400 italic">No code submitted yet</span>
                              )}
                            </div>

                            {/* Score progress bar */}
                            {(() => {
                              const pct = s.maxPossibleScore > 0 ? (s.totalScore / s.maxPossibleScore) * 100 : 0;
                              return (
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-xs">
                                  <div
                                    className={`h-full rounded-full ${pct >= 75 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400"}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <button
                          onClick={() => { if (canExpand) setExpandedStudent(expandedStudent === s.student.sap ? null : s.student.sap); }}
                          className={`ml-4 p-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 text-xs font-semibold ${
                            canExpand
                              ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                              : "text-gray-300 cursor-default"
                          }`}
                        >
                          <span>{expandedStudent === s.student.sap ? "Hide Details" : "View Details & Audit"}</span>
                          <svg className={`h-4 w-4 transition-transform duration-200 ${expandedStudent === s.student.sap ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED ACCORDION: Submissions & Proctoring Audit Timeline */}
                    {expandedStudent === s.student.sap && (
                      <div className="px-6 pb-6 pt-2 bg-slate-50/60 border-t border-gray-100 space-y-5">
                        {/* Submissions Section */}
                        {s.submissions.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Submitted Code & Evaluations</p>
                            <div className="space-y-3">
                              {s.submissions.map(sub => (
                                <div key={sub.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="text-sm font-semibold text-gray-800">{sub.question.title}</h5>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className={`font-semibold ${sub.isSuccessful ? "text-emerald-600" : "text-red-500"}`}>
                                          {sub.isSuccessful ? "✓ Passed all test cases" : "✗ Failed test cases"}
                                        </span>
                                        <span>Score: {sub.score}/{sub.question.score}</span>
                                        <span className="font-mono uppercase">{sub.language}</span>
                                        <span>{fmtTime(sub.createdAt)}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sub.isSuccessful ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                        {sub.score} pts
                                      </span>
                                      {sub.language !== "mcq" && sub.code && (
                                        <button
                                          onClick={() => setExpandedCode(expandedCode === sub.id ? null : sub.id)}
                                          className="text-xs px-3 py-1 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium"
                                        >
                                          {expandedCode === sub.id ? "Hide Code" : "Inspect Code"}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {expandedCode === sub.id && sub.code && (
                                    <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                                      <Editor
                                        height="220px"
                                        language={sub.language === "python" ? "python" : sub.language === "c" ? "c" : "javascript"}
                                        value={sub.code}
                                        theme="vs-dark"
                                        options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, lineNumbers: "on" }}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Proctoring Activity Timeline with Visual Snapshots */}
                        {plog && plog.totalViolations > 0 && (
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                🛡️ Proctoring Violations Timeline ({plog.totalViolations} events recorded)
                              </p>
                              {plog.totalViolations >= 5 && (
                                <span className="text-xs bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                                  Terminated upon Strike 5
                                </span>
                              )}
                            </div>

                            <div className="space-y-3">
                              {plog.events.map(ev => (
                                <div key={ev.type} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">{EVENT_META[ev.type]?.icon ?? "⚠️"}</span>
                                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${EVENT_META[ev.type]?.color ?? "bg-gray-100 text-gray-600"}`}>
                                        {EVENT_META[ev.type]?.label ?? ev.type}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                                      {ev.entries.length} occurrence{ev.entries.length > 1 ? "s" : ""}
                                    </span>
                                  </div>

                                  <div className="space-y-2.5">
                                    {ev.entries.map((entry, ei) => {
                                      const { reason, snapshot } = parseProctorContent(entry.content);
                                      return (
                                        <div key={ei} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-mono text-slate-500 text-[11px]">
                                              🕒 {fmtTime(entry.timestamp)}
                                            </span>
                                            {snapshot && (
                                              <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                                                Visual Evidence Captured
                                              </span>
                                            )}
                                          </div>

                                          <p className="text-slate-800 font-medium">{reason}</p>

                                          {/* Webcam Evidence Thumbnail Preview */}
                                          {snapshot && (
                                            <div className="mt-2.5 flex items-center gap-3">
                                              <img
                                                src={snapshot}
                                                alt="Webcam snapshot"
                                                onClick={() => setEvidenceModal({
                                                  studentName: `${s.student.firstName} ${s.student.lastName}`,
                                                  sap: s.student.sap,
                                                  type: ev.type,
                                                  timestamp: entry.timestamp,
                                                  reason,
                                                  snapshot,
                                                })}
                                                className="w-24 h-16 object-cover rounded-lg border-2 border-red-400 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                              />
                                              <button
                                                onClick={() => setEvidenceModal({
                                                  studentName: `${s.student.firstName} ${s.student.lastName}`,
                                                  sap: s.student.sap,
                                                  type: ev.type,
                                                  timestamp: entry.timestamp,
                                                  reason,
                                                  snapshot,
                                                })}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 underline font-semibold flex items-center gap-1"
                                              >
                                                <span>Click to inspect full photo</span>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
