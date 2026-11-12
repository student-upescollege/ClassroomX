"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/lib/api";

type QuestionType = "CODING" | "MCQ";
type Difficulty = "Easy" | "Medium" | "Hard";

interface Param { name: string; type: string }
interface TestCase { input: string; expectedOutput: string; isHidden: boolean }

interface BankQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  defaultScore: number;
  type: QuestionType;
  options: string[];
  functionName?: string;
  parameters?: Param[];
  returnType?: string;
  authorLabel?: string;
  testCases: TestCase[];
}

interface QuestionBank {
  id: number;
  tag: string;
  label: string;
  description: string;
  questions: BankQuestion[];
}

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  Easy:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};

const TYPE_STYLE: Record<QuestionType, string> = {
  CODING: "bg-indigo-100 text-indigo-700 border-indigo-200",
  MCQ:    "bg-amber-100 text-amber-700 border-amber-200",
};

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const RETURN_TYPES = ["number","string","boolean","number[]","string[]","number[][]","string[][]"];

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200";

const token = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

const blankQ = (): {
  type: QuestionType; title: string; description: string; score: number;
  functionName: string; parameters: Param[]; returnType: string;
  options: string[]; testCases: TestCase[];
} => ({
  type: "CODING", title: "", description: "", score: 10,
  functionName: "", parameters: [], returnType: "",
  options: ["", "", "", ""],
  testCases: [
    { input: "", expectedOutput: "", isHidden: false },
    { input: "", expectedOutput: "", isHidden: false },
  ],
});

export default function QuestionBankPage() {
  const router = useRouter();
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBanks, setExpandedBanks] = useState<Set<number>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // Confirm dialogs
  const [deleteBankTarget, setDeleteBankTarget] = useState<QuestionBank | null>(null);
  const [deleteQTarget, setDeleteQTarget] = useState<{ q: BankQuestion; bankLabel: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add question modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addBankId, setAddBankId] = useState<number | null>(null);
  const [addMode, setAddMode] = useState<"existing" | "new">("existing");
  const [newBankTag, setNewBankTag] = useState("");
  const [newBankLabel, setNewBankLabel] = useState("");
  const [newBankDesc, setNewBankDesc] = useState("");
  const [addDifficulty, setAddDifficulty] = useState<Difficulty>("Medium");
  const [addTags, setAddTags] = useState("");
  const [addAuthor, setAddAuthor] = useState("");
  const [q, setQ] = useState(blankQ());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // AI assist
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_URL}/faculty/question-banks`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setBanks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.replace("/auth/signin");
      return;
    }
    fetchBanks();
  }, []);

  const toggleBank = (id: number) =>
    setExpandedBanks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleQuestion = (id: number) =>
    setExpandedQuestions(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Delete bank ──────────────────────────────────────────────────────────
  const handleDeleteBank = async () => {
    if (!deleteBankTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/faculty/question-bank/${deleteBankTarget.id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setBanks(prev => prev.filter(b => b.id !== deleteBankTarget.id));
      setDeleteBankTarget(null);
    } catch (e) { console.error(e); } finally { setDeleting(false); }
  };

  // ── Delete question ──────────────────────────────────────────────────────
  const handleDeleteQuestion = async () => {
    if (!deleteQTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/faculty/question-bank/question/${deleteQTarget.q.id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setBanks(prev => prev.map(b => ({ ...b, questions: b.questions.filter(x => x.id !== deleteQTarget.q.id) })));
      setDeleteQTarget(null);
    } catch (e) { console.error(e); } finally { setDeleting(false); }
  };

  // ── Add modal helpers ────────────────────────────────────────────────────
  const resetAdd = () => {
    setShowAddModal(false);
    setAddMode("existing");
    setNewBankTag(""); setNewBankLabel(""); setNewBankDesc("");
    setAddDifficulty("Medium"); setAddTags(""); setAddAuthor("");
    setQ(blankQ()); setSaveError("");
    setAiEnabled(false); setAiError(""); setAiGenerated(false);
  };

  const openAddModal = (bankId?: number) => {
    resetAdd();
    if (bankId != null) { setAddBankId(bankId); setAddMode("existing"); }
    else setAddBankId(banks[0]?.id ?? null);
    setShowAddModal(true);
  };

  // ── AI Generate ──────────────────────────────────────────────────────────
  const handleAiGenerate = async () => {
    setAiError("");
    if (!q.description.trim()) {
      setAiError("Please write a problem description first — the AI needs context to generate the question.");
      return;
    }
    setAiGenerating(true);
    setAiGenerated(false);
    try {
      const res = await axios.post(
        `${API_URL}/faculty/question-bank/ai-generate`,
        { description: q.description, type: q.type },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      const data = res.data;

      if (q.type === "CODING") {
        setQ(prev => ({
          ...prev,
          title: data.title ?? prev.title,
          description: data.description ?? prev.description,
          functionName: data.functionName ?? "",
          returnType: data.returnType ?? "",
          parameters: Array.isArray(data.parameters) ? data.parameters : [],
          testCases: Array.isArray(data.testCases) && data.testCases.length > 0
            ? data.testCases
            : prev.testCases,
        }));
      } else {
        // MCQ: fill options and mark correct answer via testCase
        const opts: string[] = Array.isArray(data.options) ? data.options : ["", "", "", ""];
        const correctLetter: string = data.correctLetter ?? "A";
        setQ(prev => ({
          ...prev,
          title: data.title ?? prev.title,
          description: data.description || prev.description,
          options: opts,
          testCases: [{ input: "", expectedOutput: correctLetter, isHidden: false }],
        }));
      }
      setAiGenerated(true);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "AI generation failed. Please try again.";
      setAiError(msg);
    } finally {
      setAiGenerating(false);
    }
  };

  // TestCase helpers
  const setTC = (i: number, field: keyof TestCase, value: string | boolean) =>
    setQ(prev => {
      const tcs = [...prev.testCases];
      (tcs[i] as any)[field] = value;
      return { ...prev, testCases: tcs };
    });

  const addTC = () =>
    setQ(prev => ({ ...prev, testCases: [...prev.testCases, { input: "", expectedOutput: "", isHidden: false }] }));

  const removeTC = (i: number) =>
    setQ(prev => ({ ...prev, testCases: prev.testCases.filter((_, idx) => idx !== i) }));

  // Parameter helpers
  const addParam = () => setQ(prev => ({ ...prev, parameters: [...prev.parameters, { name: "", type: "number" }] }));
  const setParam = (i: number, field: keyof Param, val: string) =>
    setQ(prev => { const p = [...prev.parameters]; p[i] = { ...p[i], [field]: val }; return { ...prev, parameters: p }; });
  const removeParam = (i: number) =>
    setQ(prev => ({ ...prev, parameters: prev.parameters.filter((_, idx) => idx !== i) }));

  // MCQ helpers
  const setOption = (i: number, val: string) =>
    setQ(prev => { const o = [...prev.options]; o[i] = val; return { ...prev, options: o }; });
  const markCorrect = (letter: string) =>
    setQ(prev => ({ ...prev, testCases: [{ input: "", expectedOutput: letter, isHidden: false }] }));
  const removeOption = (i: number) => {
    const removed = String.fromCharCode(65 + i);
    setQ(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== i),
      testCases: prev.testCases[0]?.expectedOutput === removed
        ? [{ input: "", expectedOutput: "", isHidden: false }]
        : prev.testCases,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveError("");
    try {
      const bankTag = addMode === "existing"
        ? banks.find(b => b.id === addBankId)?.tag ?? ""
        : newBankTag.trim().toUpperCase();
      if (!bankTag) { setSaveError("Please select or enter a bank tag."); setSaving(false); return; }

      await axios.post(`${API_URL}/faculty/question-bank/save`, {
        bankTag,
        bankLabel: addMode === "new" ? (newBankLabel || bankTag) : undefined,
        bankDescription: addMode === "new" ? newBankDesc : undefined,
        question: {
          title: q.title,
          description: q.description,
          type: q.type,
          difficulty: addDifficulty,
          defaultScore: q.score,
          tags: addTags.split(",").map(t => t.trim()).filter(Boolean),
          authorLabel: addAuthor.trim() || undefined,
          options: q.type === "MCQ" ? q.options.filter(Boolean) : [],
          functionName: q.type === "CODING" ? (q.functionName || undefined) : undefined,
          parameters: q.type === "CODING" && q.parameters.length ? q.parameters : undefined,
          returnType: q.type === "CODING" ? (q.returnType || undefined) : undefined,
          testCases: q.type === "CODING"
            ? q.testCases.filter(tc => tc.input || tc.expectedOutput)
            : q.testCases.slice(0, 1),
        },
      }, { headers: { Authorization: `Bearer ${token()}` } });

      await fetchBanks();
      resetAdd();
    } catch (err) {
      setSaveError(axios.isAxiosError(err) ? (err.response?.data?.message || err.message) : "Failed to save");
    } finally { setSaving(false); }
  };

  const totalQuestions = banks.reduce((s, b) => s + b.questions.length, 0);

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
          <button onClick={() => router.push("/faculty/dashboard")}
            className="flex items-center gap-2 text-sm text-indigo-200 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="bg-indigo-700 text-white pb-14 pt-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-1">Question Bank</h1>
          <p className="text-indigo-300 text-sm">{banks.length} categories · {totalQuestions} questions total</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 pb-16">
        <div className="flex justify-end mb-5">
          <button onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Question
          </button>
        </div>

        {banks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No questions in the bank yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {banks.map(bank => (
              <div key={bank.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4">
                  <button onClick={() => toggleBank(bank.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <svg className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${expandedBanks.has(bank.id) ? "rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{bank.label}</span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{bank.tag}</span>
                        <span className="text-xs text-gray-400">{bank.questions.length} question{bank.questions.length !== 1 ? "s" : ""}</span>
                      </div>
                      {bank.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{bank.description}</p>}
                    </div>
                  </button>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button onClick={() => openAddModal(bank.id)}
                      className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Add question">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteBankTarget(bank)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete category">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedBanks.has(bank.id) && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {bank.questions.length === 0 ? (
                      <div className="px-6 py-8 text-center text-sm text-gray-400">No questions in this category.</div>
                    ) : (
                      bank.questions.map(bq => (
                        <div key={bq.id} className="px-6 py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <button onClick={() => toggleQuestion(bq.id)}
                                  className="font-medium text-gray-900 text-sm hover:text-indigo-700 transition-colors text-left">
                                  {bq.title}
                                </button>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_STYLE[bq.type]}`}>{bq.type}</span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLE[bq.difficulty]}`}>{bq.difficulty}</span>
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{bq.defaultScore} pts</span>
                                {bq.authorLabel && (
                                  <span className="text-[10px] text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">by {bq.authorLabel}</span>
                                )}
                              </div>
                              {bq.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {bq.tags.map(t => <span key={t} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{t}</span>)}
                                </div>
                              )}
                              {expandedQuestions.has(bq.id) && (
                                <div className="mt-3 space-y-3">
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{bq.description}</p>
                                  {bq.type === "CODING" && (
                                    <>
                                      {(bq.functionName || bq.returnType) && (
                                        <div className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                                          {bq.functionName && <span>fn: <strong>{bq.functionName}</strong></span>}
                                          {bq.returnType && <span className="ml-3">→ {bq.returnType}</span>}
                                        </div>
                                      )}
                                      {bq.testCases.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold text-gray-500 mb-1.5">Test Cases ({bq.testCases.length})</p>
                                          <div className="space-y-1.5">
                                            {bq.testCases.map((tc, i) => (
                                              <div key={i} className={`text-xs font-mono px-3 py-2 rounded-lg flex gap-4 ${tc.isHidden ? "bg-gray-100 text-gray-400" : "bg-slate-50 text-gray-700"}`}>
                                                <span className="shrink-0 text-gray-400">#{i+1}{tc.isHidden ? " 🔒" : ""}</span>
                                                <span>in: <strong>{tc.input || "—"}</strong></span>
                                                <span>out: <strong>{tc.expectedOutput || "—"}</strong></span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {bq.type === "MCQ" && bq.options.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 mb-1.5">Options</p>
                                      <div className="space-y-1">
                                        {bq.options.map((opt, i) => {
                                          const letter = String.fromCharCode(65 + i);
                                          const isCorrect = bq.testCases[0]?.expectedOutput === letter;
                                          return (
                                            <div key={i} className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${isCorrect ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-gray-50 text-gray-700"}`}>
                                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isCorrect ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}>{letter}</span>
                                              {opt}
                                              {isCorrect && <span className="ml-auto text-[10px] font-bold text-emerald-600">✓ Correct</span>}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0 mt-0.5">
                              <button onClick={() => toggleQuestion(bq.id)}
                                className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className={`h-4 w-4 transition-transform ${expandedQuestions.has(bq.id) ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <button onClick={() => setDeleteQTarget({ q: bq, bankLabel: bank.label })}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Delete bank ───────────────────────────────────────────────────── */}
      {deleteBankTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete category?</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Permanently delete <strong>{deleteBankTarget.label}</strong> and all {deleteBankTarget.questions.length} question{deleteBankTarget.questions.length !== 1 ? "s" : ""} in it.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setDeleteBankTarget(null)} disabled={deleting}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleDeleteBank} disabled={deleting}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 font-medium flex items-center gap-2">
                {deleting && <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete question ───────────────────────────────────────────────── */}
      {deleteQTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete question?</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Remove <strong>{deleteQTarget.q.title}</strong> from <strong>{deleteQTarget.bankLabel}</strong>?
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setDeleteQTarget(null)} disabled={deleting}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleDeleteQuestion} disabled={deleting}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 font-medium flex items-center gap-2">
                {deleting && <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Question modal ────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-base font-semibold text-gray-900">Add Question to Bank</h3>
              <button onClick={resetAdd} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* Category */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</p>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                  {(["existing","new"] as const).map(m => (
                    <button key={m} type="button" onClick={() => setAddMode(m)}
                      className={`flex-1 py-2 transition-colors ${addMode === m ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                      {m === "existing" ? "Existing Category" : "New Category"}
                    </button>
                  ))}
                </div>
                {addMode === "existing" ? (
                  banks.length === 0
                    ? <p className="text-sm text-amber-600">No categories yet — switch to "New Category".</p>
                    : <select value={addBankId ?? ""} onChange={e => setAddBankId(Number(e.target.value))} className={inputClass}>
                        {banks.map(b => <option key={b.id} value={b.id}>{b.label} ({b.tag})</option>)}
                      </select>
                ) : (
                  <div className="space-y-2">
                    <input type="text" placeholder="Tag (e.g. DSA)" value={newBankTag} onChange={e => setNewBankTag(e.target.value)} className={inputClass} required />
                    <input type="text" placeholder="Label (e.g. Data Structures)" value={newBankLabel} onChange={e => setNewBankLabel(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Description (optional)" value={newBankDesc} onChange={e => setNewBankDesc(e.target.value)} className={inputClass} />
                  </div>
                )}
              </div>

              {/* Type pills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <div className="flex gap-2">
                  {(["CODING","MCQ"] as QuestionType[]).map(t => (
                    <button key={t} type="button" onClick={() => { setQ(p => ({ ...blankQ(), type: t, description: p.description })); setAiGenerated(false); setAiError(""); }}
                      className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all uppercase tracking-wide ${
                        q.type === t ? TYPE_STYLE[t] : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                      }`}>
                      {t === "CODING" ? "Coding" : "MCQ"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title + Score */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Title</label>
                  <input type="text" required
                    placeholder={q.type === "MCQ" ? "e.g. Which data structure uses LIFO?" : "e.g. Implement Binary Search"}
                    value={q.title} onChange={e => setQ(p => ({ ...p, title: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                  <input type="number" min={1} max={100} value={q.score}
                    onChange={e => setQ(p => ({ ...p, score: parseInt(e.target.value) || 10 }))} className={inputClass} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
                <textarea rows={3} required={q.type === "CODING"}
                  placeholder="Detailed problem statement with constraints and examples…"
                  value={q.description} onChange={e => { setQ(p => ({ ...p, description: e.target.value })); setAiGenerated(false); }}
                  className={inputClass + " resize-none"} />
              </div>

              {/* ── AI Assist section ─────────────────────────────────────── */}
              <div className={`rounded-xl border-2 transition-colors ${aiEnabled ? "border-violet-200 bg-violet-50/40" : "border-dashed border-gray-200 bg-gray-50/50"}`}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${aiEnabled ? "bg-violet-100" : "bg-gray-100"}`}>
                      <svg className={`h-4 w-4 ${aiEnabled ? "text-violet-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${aiEnabled ? "text-violet-900" : "text-gray-700"}`}>AI Question Generator</p>
                      <p className={`text-xs mt-0.5 ${aiEnabled ? "text-violet-600" : "text-gray-400"}`}>
                        {aiEnabled
                          ? "AI will generate the full question from your description"
                          : "Enable to let AI generate the question for you"}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setAiEnabled(e => !e); setAiError(""); setAiGenerated(false); }}
                    className={`relative inline-flex flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${aiEnabled ? "bg-violet-500" : "bg-gray-300"}`}>
                    <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${aiEnabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                {aiEnabled && (
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t border-violet-100">
                    <div className="flex items-center gap-3 pt-3">
                      <button type="button" onClick={handleAiGenerate} disabled={aiGenerating}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">
                        {aiGenerating ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                            Generating…
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Generate with AI
                          </>
                        )}
                      </button>
                      {aiGenerated && !aiGenerating && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Question generated — review and edit below
                        </span>
                      )}
                    </div>
                    {aiError && (
                      <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-lg">
                        <svg className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {aiError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Difficulty / Tags / Author */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={addDifficulty} onChange={e => setAddDifficulty(e.target.value as Difficulty)} className={inputClass}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="font-normal text-gray-400">(comma sep.)</span></label>
                  <input type="text" value={addTags} onChange={e => setAddTags(e.target.value)} placeholder="array, sort, …" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author <span className="font-normal text-gray-400">(optional)</span></label>
                  <input type="text" value={addAuthor} onChange={e => setAddAuthor(e.target.value)} placeholder="Prof. Sharma" className={inputClass} />
                </div>
              </div>

              {/* ── CODING: Function Signature ────────────────────────────── */}
              {q.type === "CODING" && (
                <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Function Signature <span className="text-xs font-normal text-gray-400 ml-1">optional</span></p>
                      <p className="text-xs text-gray-400 mt-0.5">Define a function — students implement it, you pass args as test inputs</p>
                    </div>
                    {q.functionName && (
                      <button type="button"
                        onClick={() => setQ(p => ({ ...p, functionName: "", parameters: [], returnType: "" }))}
                        className="text-xs text-red-400 hover:text-red-600 font-medium">
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Function Name</label>
                      <input type="text" placeholder="e.g. findMaximum"
                        value={q.functionName} onChange={e => setQ(p => ({ ...p, functionName: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Return Type</label>
                      <select value={q.returnType} onChange={e => setQ(p => ({ ...p, returnType: e.target.value }))} className={inputClass}>
                        <option value="">Select type…</option>
                        {RETURN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-gray-500">Parameters</label>
                      <button type="button" onClick={addParam}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add
                      </button>
                    </div>
                    {q.parameters.length === 0 && <p className="text-xs text-gray-300 italic">No parameters yet</p>}
                    <div className="space-y-2">
                      {q.parameters.map((p, pi) => (
                        <div key={pi} className="flex items-center gap-2">
                          <input type="text" placeholder="name" value={p.name}
                            onChange={e => setParam(pi, "name", e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300" />
                          <select value={p.type} onChange={e => setParam(pi, "type", e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {RETURN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <button type="button" onClick={() => removeParam(pi)}
                            className="p-1.5 text-gray-300 hover:text-red-500 rounded transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {q.functionName && (
                    <div className="bg-gray-900 rounded-lg px-4 py-3">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Student sees</p>
                      <code className="text-sm font-mono">
                        <span className="text-blue-400">function </span>
                        <span className="text-yellow-300">{q.functionName}</span>
                        <span className="text-gray-300">(</span>
                        <span className="text-orange-300">{q.parameters.map(p => p.name).join(", ")}</span>
                        <span className="text-gray-300">) {"{"}</span>
                        <span className="text-gray-500"> … </span>
                        <span className="text-gray-300">{"}"}</span>
                      </code>
                    </div>
                  )}
                </div>
              )}

              {/* ── MCQ Options ───────────────────────────────────────────── */}
              {q.type === "MCQ" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Answer Options <span className="text-xs font-normal text-gray-400">(mark correct with ✓)</span>
                    </label>
                    <button type="button" onClick={() => setQ(p => ({ ...p, options: [...p.options, ""] }))}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const letter = String.fromCharCode(65 + oi);
                      const isCorrect = q.testCases[0]?.expectedOutput === letter;
                      return (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0">{letter}</span>
                          <input type="text" placeholder={`Option ${letter}`} value={opt}
                            onChange={e => setOption(oi, e.target.value)} className={inputClass + " flex-1"} />
                          <button type="button" onClick={() => markCorrect(letter)} title="Mark as correct answer"
                            className={`p-1.5 rounded-lg border transition-all text-sm ${
                              isCorrect ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                            }`}>✓</button>
                          {q.options.length > 2 && (
                            <button type="button" onClick={() => removeOption(oi)}
                              className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── CODING: Test Cases ────────────────────────────────────── */}
              {q.type === "CODING" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Test Cases</label>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {q.functionName
                          ? <>Arguments as JSON — e.g. <code className="font-mono bg-gray-100 px-1 rounded">[[3,7,1,9,4]]</code></>
                          : "Each line in stdin is a separate input line"}
                      </p>
                    </div>
                    <button type="button" onClick={addTC}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Test Case
                    </button>
                  </div>
                  <div className="space-y-3">
                    {q.testCases.map((tc, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold flex items-center justify-center">{i+1}</span>
                            <span className="text-xs font-semibold text-gray-600">Test Case {i+1}</span>
                            {tc.isHidden && <span className="text-[10px] font-semibold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200">Hidden</span>}
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 cursor-pointer select-none">
                              <input type="checkbox" checked={tc.isHidden}
                                onChange={e => setTC(i, "isHidden", e.target.checked)}
                                className="h-3.5 w-3.5 rounded accent-indigo-600" />
                              Hidden <span className="text-gray-400 font-normal">(not shown to students)</span>
                            </label>
                            {q.testCases.length > 2 && (
                              <button type="button" onClick={() => removeTC(i)}
                                className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-gray-100">
                          <div className="bg-slate-50 p-3">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                              {q.functionName ? "Arguments (JSON)" : "stdin / Input"}
                            </p>
                            <textarea rows={3}
                              placeholder={q.functionName ? "e.g.\n[[3,7,1,9,4]]" : "e.g.\n5\n1 2 3 4 5"}
                              value={tc.input} onChange={e => setTC(i, "input", e.target.value)}
                              className="w-full px-3 py-2 text-sm font-mono text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-y placeholder-gray-300"
                              spellCheck={false} />
                          </div>
                          <div className="bg-slate-50 p-3">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Expected Output</p>
                            <textarea rows={3} placeholder="e.g.\n15"
                              value={tc.expectedOutput} onChange={e => setTC(i, "expectedOutput", e.target.value)}
                              className="w-full px-3 py-2 text-sm font-mono text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-y placeholder-gray-300"
                              spellCheck={false} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {saveError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">{saveError}</div>
              )}

              <div className="flex justify-end gap-3 pt-1 pb-1">
                <button type="button" onClick={resetAdd}
                  className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 font-semibold flex items-center gap-2">
                  {saving && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                  {saving ? "Saving…" : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
