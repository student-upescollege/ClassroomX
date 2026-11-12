"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { API_URL } from "@/lib/api";

const SEMESTERS = ["ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT"];
const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

export default function FacultyDashboard() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [user, setUserData] = useState({ firstName: "", lastName: "", email: "", employeeID: null as number | null });
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; course: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("FOUR");
  const [batchValues, setBatchValues] = useState<number[]>([1]);

  const token = () => localStorage.getItem("access_token");

  const getUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/faculty/me`, { headers: { Authorization: `Bearer ${token()}` } });
      setUserData(res.data);
      setUser(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_type");
        router.replace("/auth/signin");
      }
    } finally { setLoading(false); }
  };

  const getClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/faculty/classrooms`, { headers: { Authorization: `Bearer ${token()}` } });
      setClasses(res.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => {
    if (!localStorage.getItem("access_token")) { window.location.href = "/auth/signin"; return; }
    getUser();
    getClasses();
    window.history.pushState(null, '', window.location.href);
    const handlePop = () => { window.history.pushState(null, '', window.location.href); };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const addBatch = () => setBatchValues(p => [...p, Math.max(...p) + 1]);
  const removeBatch = (i: number) => { if (batchValues.length > 1) setBatchValues(p => p.filter((_, idx) => idx !== i)); };
  const handleBatchChange = (i: number, v: string) => setBatchValues(p => p.map((val, idx) => idx === i ? (parseInt(v) || 1) : val));

  const resetModal = () => { setShowModal(false); setCreateError(""); setCourse(""); setSemester("FOUR"); setBatchValues([1]); };

  const handleDeleteClass = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/faculty/classroom/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setClasses(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      console.log(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setCreateError("");
    try {
      await axios.post(`${API_URL}/faculty/create`,
        { course, semester, batches: batchValues.map(batchId => ({ batchId, semester })) },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      resetModal();
      await getClasses();
    } catch (err: unknown) {
      setCreateError(axios.isAxiosError(err) ? (err.response?.data?.message || err.message) : "Failed to create class");
    } finally { setCreating(false); }
  };

  const isSessionActive = (s: any) => s.isActive && (!s.endTime || new Date(s.endTime) > new Date());
  const totalLiveSessions = classes.reduce((sum, c) => sum + (c.sessions?.filter(isSessionActive).length || 0), 0);
  const totalBatches = classes.reduce((sum, c) => sum + (c.batches?.length || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white text-indigo-700 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm">ACL</div>
            <span className="text-xl font-bold tracking-tight">AiCodeLab</span>
          </div>
          <div className="flex items-center gap-3" ref={profileRef}>
            <div className="relative">
              <button onClick={() => setShowProfile(p => !p)}
                className="flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-xl transition-colors">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-indigo-300 mt-0.5">Faculty</p>
                </div>
                <svg className={`h-4 w-4 text-indigo-300 transition-transform ${showProfile ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                  {/* Profile header */}
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-5 py-4 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-lg font-bold mb-2">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-indigo-300 text-xs mt-0.5">{user.email}</p>
                  </div>
                  {/* Details */}
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Role</span>
                      <span className="text-sm font-medium text-gray-700 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">Faculty</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Employee ID</span>
                      <span className="text-sm font-medium text-gray-700">{user.employeeID}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Classes</span>
                      <span className="text-sm font-medium text-gray-700">{classes.length}</span>
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
        </div>
      </header>

      {/* Hero */}
      <div className="bg-indigo-700 text-white pb-16 pt-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-1">Welcome back, {user.firstName}!</h1>
          <p className="text-indigo-300 text-sm">Here's what's happening with your classes today.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Classes", value: classes.length, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", color: "text-indigo-600 bg-indigo-50" },
            { label: "Live Sessions", value: totalLiveSessions, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-emerald-600 bg-emerald-50" },
            { label: "Total Batches", value: totalBatches, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "text-amber-600 bg-amber-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{s.label}</span>
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

        {/* Classes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Your Classes</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => router.push("/faculty/question-bank")}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Question Bank
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Class
              </button>
            </div>
          </div>

          {classes.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No classes yet. Create your first class to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {classes.map((cls) => {
                const liveSessions: any[] = cls.sessions?.filter(isSessionActive) ?? [];
                return (
                  <div key={cls.id} className="relative group">
                    <Link href={`/faculty/classroom/${cls.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-sm">
                            {cls.course.slice(0, 2).toUpperCase()}
                          </div>
                          {liveSessions.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 truncate">{cls.course}</h3>
                            {liveSessions.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                {liveSessions.length} Live
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Semester {cls.semester} · Batches: {cls.batches.map((b: any) => b.batchId).sort((a: number, b: number) => a - b).join(", ")}
                          </p>
                          {liveSessions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {liveSessions.map((s: any) => (
                                <span key={s.id} className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 truncate max-w-[160px]">
                                  {s.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <svg className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                    {/* Delete button — outside Link to avoid navigation */}
                    <button
                      onClick={() => setDeleteTarget({ id: cls.id, course: cls.course })}
                      className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete class">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Remove class?</h3>
                <p className="text-sm text-gray-500 mt-0.5">This will permanently delete <strong>{deleteTarget.course}</strong> and all its sessions.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button onClick={handleDeleteClass} disabled={deleting}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors font-medium flex items-center gap-2">
                {deleting && <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                {deleting ? "Removing…" : "Yes, remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create class modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Create New Class</h3>
              <button onClick={resetModal} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input type="text" required placeholder="e.g. DS" value={course} onChange={e => setCourse(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select value={semester} onChange={e => setSemester(e.target.value)} className={inputClass}>
                  {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batches</label>
                <div className="space-y-2">
                  {batchValues.map((val, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="number" min="1" required value={val} onChange={e => handleBatchChange(idx, e.target.value)} placeholder="Batch ID" className={inputClass} />
                      {batchValues.length > 1 && (
                        <button type="button" onClick={() => removeBatch(idx)} className="px-2 text-red-400 hover:text-red-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addBatch} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Batch
                </button>
              </div>
              {createError && <div className="text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-lg">{createError}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2">
                  {creating && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                  {creating ? "Creating..." : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
