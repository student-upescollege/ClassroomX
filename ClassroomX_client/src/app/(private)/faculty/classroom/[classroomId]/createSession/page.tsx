"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { API_URL } from "@/lib/api";

type QuestionType = "CODING" | "MCQ";

interface CodingQuestion {
  title: string;
  description: string;
  score: number;
  type: QuestionType;
  options: string[];
  functionName?: string;
  parameters?: { name: string; type: string }[];
  returnType?: string;
  aiEnabled?: boolean;
  aiMaxUses?: number;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

const QUESTION_TYPE_STYLE: Record<QuestionType, string> = {
  CODING: "bg-indigo-100 text-indigo-700 border-indigo-200",
  MCQ:    "bg-amber-100 text-amber-700 border-amber-200",
};

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  CODING: "Coding",
  MCQ:    "MCQ",
};

interface ApiBankSummary {
  id: number;
  tag: string;
  label: string;
  description: string;
  _count: { questions: number };
}

interface ApiBankQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  defaultScore: number;
  type?: QuestionType;
  options?: string[];
  functionName?: string;
  parameters?: { name: string; type: string }[];
  returnType?: string;
  authorLabel?: string;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Medium: "bg-amber-50 text-amber-700 border-amber-100",
  Hard: "bg-red-50 text-red-700 border-red-100",
};

const BANK_TAG_STYLE: Record<string, string> = {
  DSA:       "bg-indigo-100 text-indigo-700",
  MATH:      "bg-emerald-100 text-emerald-700",
  STRINGS:   "bg-violet-100 text-violet-700",
  GRAPHS:    "bg-cyan-100 text-cyan-700",
  TREES:     "bg-lime-100 text-lime-700",
  DP:        "bg-orange-100 text-orange-700",
  SORTING:   "bg-blue-100 text-blue-700",
  RECURSION: "bg-pink-100 text-pink-700",
  OOP:       "bg-teal-100 text-teal-700",
  DBMS:      "bg-yellow-100 text-yellow-700",
  OS:        "bg-red-100 text-red-700",
  NETWORKS:  "bg-sky-100 text-sky-700",
  PYTHON:    "bg-fuchsia-100 text-fuchsia-700",
};

const inputClass =
  "w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200";

export default function CreateLiveCodingSessionPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const classroomId = React.use(params).classroomId;

  const [sessionData, setSessionData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    classroomId: Number(classroomId),
    showResultsImmediately: true,
  });

  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<CodingQuestion>({
    title: "",
    description: "",
    score: 10,
    type: "CODING",
    options: ["", "", "", ""],
    functionName: undefined,
    parameters: undefined,
    returnType: undefined,
    aiEnabled: false,
    aiMaxUses: 3,
    testCases: [
      { input: "", expectedOutput: "", isHidden: false },
      { input: "", expectedOutput: "", isHidden: false },
    ],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  // Question bank panel state
  const [showBank, setShowBank] = useState(false);
  const [selectedBankTag, setSelectedBankTag] = useState<string | null>(null);
  const [bankFilter, setBankFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [bankTypeFilter, setBankTypeFilter] = useState<"All" | "CODING" | "MCQ">("All");
  const [bankSearch, setBankSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [addedFromBank, setAddedFromBank] = useState<Set<number>>(new Set());
  const [banks, setBanks] = useState<ApiBankSummary[]>([]);
  const [bankQuestions, setBankQuestions] = useState<ApiBankQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [expandedQ, setExpandedQ] = useState<Set<number>>(new Set());

  // Save to bank modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMode, setSaveMode] = useState<"existing" | "new">("existing");
  const [saveTag, setSaveTag] = useState("");
  const [saveLabel, setSaveLabel] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [saveDifficulty, setSaveDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [saveTags, setSaveTags] = useState("");
  const [saveAuthor, setSaveAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const token = () => localStorage.getItem("access_token");

  // Fetch bank list on mount (needed for both bank panel and save modal)
  useEffect(() => {
    axios
      .get(`${API_URL}/question-bank/banks`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => setBanks(r.data))
      .catch(console.error);
  }, []);

  // Re-fetch banks when panel opens (to pick up any newly created ones)
  useEffect(() => {
    if (!showBank) return;
    axios
      .get(`${API_URL}/question-bank/banks`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => setBanks(r.data))
      .catch(console.error);
  }, [showBank]);

  // Fetch questions when a bank is selected
  useEffect(() => {
    if (!selectedBankTag) { setBankQuestions([]); return; }
    setBankLoading(true);
    axios
      .get(`${API_URL}/question-bank/banks/${selectedBankTag}/questions`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
      .then((r) => setBankQuestions(r.data))
      .catch(console.error)
      .finally(() => setBankLoading(false));
  }, [selectedBankTag]);

  const filteredBankQuestions = bankQuestions.filter((q) => {
    const matchesDiff = bankFilter === "All" || q.difficulty === bankFilter;
    const matchesType = bankTypeFilter === "All" || (q.type ?? "CODING") === bankTypeFilter;
    const matchesSearch =
      q.title.toLowerCase().includes(bankSearch.toLowerCase()) ||
      q.tags.some((t: string) => t.toLowerCase().includes(bankSearch.toLowerCase()));
    return matchesDiff && matchesType && matchesSearch;
  });

  const addFromBank = (q: ApiBankQuestion) => {
    if (addedFromBank.has(q.id) || questions.some((e) => e.title === q.title)) return;
    setQuestions((prev) => [
      ...prev,
      {
        title: q.title,
        description: q.description,
        score: q.defaultScore,
        type: q.type ?? "CODING",
        options: q.options ?? [],
        functionName: q.functionName,
        parameters: q.parameters,
        returnType: q.returnType,
        aiEnabled: false,
        aiMaxUses: 3,
        testCases: q.testCases,
      },
    ]);
    setAddedFromBank((prev) => new Set(prev).add(q.id));
  };

  const openBank = () => {
    setSelectedBankTag(null);
    setBankFilter("All");
    setBankTypeFilter("All");
    setBankSearch("");
    setShowBank(true);
  };

  const toggleExpandQ = (i: number) =>
    setExpandedQ((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const qValid = (q: CodingQuestion) =>
    !!q.title && (q.type === "MCQ" || !!q.description);

  const addQuestion = () => {
    if (qValid(currentQuestion)) {
      setQuestions(p => [...p, currentQuestion]);
      setCurrentQuestion({
        title: "", description: "", score: 10, type: "CODING", options: ["", "", "", ""],
        functionName: undefined, parameters: undefined, returnType: undefined, aiEnabled: false, aiMaxUses: 3,
        testCases: [
          { input: "", expectedOutput: "", isHidden: false },
          { input: "", expectedOutput: "", isHidden: false },
        ],
      });
    }
  };

  const openSaveModal = () => {
    setSaveMode("existing");
    setSaveTag(banks[0]?.tag ?? "");
    setSaveLabel(""); setSaveDesc(""); setSaveTags("");
    setSaveDifficulty("Easy"); setSaveError(""); setSaveSuccess(""); setSaveAuthor("");
    setShowSaveModal(true);
  };

  const handleSaveToBank = async () => {
    if (!qValid(currentQuestion)) {
      setSaveError(currentQuestion.type === "MCQ" ? "Please fill in the question title first." : "Please fill in the question title and description first."); return;
    }
    const tag = saveMode === "existing" ? saveTag : saveLabel.toUpperCase().replace(/\s+/g, "_");
    if (!tag) { setSaveError("Please select or enter a category."); return; }
    setSaving(true); setSaveError(""); setSaveSuccess("");
    try {
      await axios.post(`${API_URL}/faculty/question-bank/save`, {
        bankTag: tag,
        bankLabel: saveMode === "new" ? saveLabel : undefined,
        bankDescription: saveMode === "new" ? saveDesc : undefined,
        question: {
          ...currentQuestion,
          difficulty: saveDifficulty,
          defaultScore: currentQuestion.score,
          tags: saveTags.split(",").map(t => t.trim()).filter(Boolean),
          authorLabel: saveAuthor.trim() || undefined,
        },
      }, { headers: { Authorization: `Bearer ${token()}` } });
      setSaveSuccess(`Question saved to "${saveMode === "existing" ? saveTag : saveLabel}" successfully!`);
      // refresh banks list
      const r = await axios.get(`${API_URL}/question-bank/banks`, { headers: { Authorization: `Bearer ${token()}` } });
      setBanks(r.data);
    } catch (e: any) {
      setSaveError(e.response?.data?.message || "Failed to save question to bank.");
    } finally { setSaving(false); }
  };

  const addTestCase = () =>
    setCurrentQuestion(q => ({ ...q, testCases: [...q.testCases, { input: "", expectedOutput: "", isHidden: false }] }));

  const removeTestCase = (i: number) => {
    if (currentQuestion.testCases.length <= 2) return;
    setCurrentQuestion(q => ({ ...q, testCases: q.testCases.filter((_, idx) => idx !== i) }));
  };

  const updateTestCase = (i: number, field: string, value: string | boolean) => {
    const updated = [...currentQuestion.testCases];
    (updated[i] as any)[field] = value;
    setCurrentQuestion(q => ({ ...q, testCases: updated }));
  };

  const removeQuestion = (i: number) => setQuestions(p => p.filter((_, idx) => idx !== i));

  const handleAiGenerate = async () => {
    setAiError("");
    if (!currentQuestion.description.trim()) {
      setAiError("Please write a problem description first — the AI needs context to generate the question.");
      return;
    }
    setAiGenerating(true);
    try {
      const res = await axios.post(
        `${API_URL}/faculty/question-bank/ai-generate`,
        { description: currentQuestion.description, type: currentQuestion.type },
        { headers: { Authorization: `Bearer ${token()}` } },
      );
      const data = res.data;
      if (data.type === "CODING") {
        setCurrentQuestion(q => ({
          ...q,
          title: data.title ?? q.title,
          description: data.description ?? q.description,
          functionName: data.functionName ?? q.functionName,
          returnType: data.returnType ?? q.returnType,
          parameters: data.parameters ?? q.parameters,
          testCases: data.testCases ?? q.testCases,
        }));
      } else {
        const correctIdx = data.correctLetter ? data.correctLetter.charCodeAt(0) - 65 : 0;
        setCurrentQuestion(q => ({
          ...q,
          title: data.title ?? q.title,
          description: data.description || q.description,
          options: data.options ?? q.options,
          testCases: [{ input: "", expectedOutput: String.fromCharCode(65 + correctIdx), isHidden: false }],
        }));
      }
    } catch (e: any) {
      setAiError(e.response?.data?.message || "AI generation failed. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const allQuestions = qValid(currentQuestion)
      ? [...questions, currentQuestion]
      : questions;
    if (allQuestions.length === 0) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const payload: Record<string, unknown> = {
        ...sessionData,
        startTime: new Date(sessionData.startTime).toISOString(),
        questions: allQuestions,
        totalScore: 0,
      };
      if (sessionData.endTime) {
        payload.endTime = new Date(sessionData.endTime).toISOString();
      }
      await axios.post(`${API_URL}/faculty/create-session`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = `/faculty/classroom/${classroomId}`;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join(", ") : (msg || err.message));
      } else {
        setError("Failed to create session");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = questions.length > 0 || qValid(currentQuestion);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href={`/faculty/classroom/${classroomId}`}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="bg-white text-indigo-700 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm">ACL</div>
          <div>
            <h1 className="text-xl font-bold leading-none">Create Session</h1>
            <p className="text-indigo-300 text-xs mt-0.5">New live coding session</p>
          </div>
        </div>
      </header>

      <div className="bg-indigo-700 pb-10" />

      <div className="max-w-4xl mx-auto px-6 -mt-6 pb-12 space-y-5">
        <form onSubmit={handleCreate} className="space-y-5">
          {/* Session Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-slide-up">
            <h2 className="text-base font-semibold text-gray-900 mb-5">
              Session Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                <input type="text" required placeholder="e.g. Data Structures — Arrays" value={sessionData.title}
                  onChange={e => setSessionData(s => ({ ...s, title: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" placeholder="Brief overview" value={sessionData.description}
                  onChange={e => setSessionData(s => ({ ...s, description: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="datetime-local" required value={sessionData.startTime}
                  onChange={e => setSessionData(s => ({ ...s, startTime: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="datetime-local" value={sessionData.endTime}
                  onChange={e => setSessionData(s => ({ ...s, endTime: e.target.value }))} className={inputClass} />
              </div>
            </div>

            {/* Result visibility toggle */}
            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Show results to students immediately</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {sessionData.showResultsImmediately
                    ? "Students will see their score and test results right after finishing."
                    : "Results are hidden until the session is over."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSessionData(s => ({ ...s, showResultsImmediately: !s.showResultsImmediately }))}
                className={`relative inline-flex flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  sessionData.showResultsImmediately ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  sessionData.showResultsImmediately ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>

          {/* Added Questions — expandable detail cards */}
          {questions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-slide-up delay-75">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">{questions.length}</span>
                Added Questions
              </h2>
              <div className="space-y-3">
                {questions.map((q, i) => {
                  const isOpen = expandedQ.has(i);
                  const visibleTc = q.testCases.filter(tc => !tc.isHidden);
                  const hiddenCount = q.testCases.filter(tc => tc.isHidden).length;
                  return (
                    <div key={i} className="border border-gray-100 rounded-xl overflow-hidden animate-slide-in-right">
                      {/* Card header — click to expand */}
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => toggleExpandQ(i)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-gray-900 truncate">{q.title}</p>
                              <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${QUESTION_TYPE_STYLE[q.type]}`}>
                                {QUESTION_TYPE_LABEL[q.type]}
                              </span>
                              {q.type === "CODING" && q.aiEnabled && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide bg-violet-50 text-violet-600 border-violet-200">
                                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                  AI
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              {q.score} pts · {q.type === "MCQ" ? `${q.options.filter(Boolean).length} options` : `${q.testCases.length} test case${q.testCases.length !== 1 ? "s" : ""}`}
                              {hiddenCount > 0 && q.type === "CODING" && <span className="ml-1 text-amber-500">({hiddenCount} hidden)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <svg className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isOpen && (
                        <div className="px-5 py-4 space-y-4 bg-white border-t border-gray-100">
                          {/* Score editor + AI toggle */}
                          <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">Score</label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number" min="1" max="100"
                                  value={q.score}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const updated = [...questions];
                                    updated[i] = { ...q, score: parseInt(e.target.value) || 1 };
                                    setQuestions(updated);
                                  }}
                                  className="w-20 px-2.5 py-1 text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                                />
                                <span className="text-xs text-gray-400">pts</span>
                              </div>
                            </div>
                            {q.type === "CODING" && (
                              <div className="flex items-center gap-2">
                                <svg className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span className="text-xs font-medium text-gray-500">AI Assist</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const updated = [...questions];
                                    updated[i] = { ...q, aiEnabled: !q.aiEnabled };
                                    setQuestions(updated);
                                  }}
                                  className={`relative inline-flex flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                                    q.aiEnabled ? "bg-violet-500" : "bg-gray-300"
                                  }`}
                                >
                                  <span className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                    q.aiEnabled ? "translate-x-4" : "translate-x-0"
                                  }`} />
                                </button>
                                {q.aiEnabled && (
                                  <div className="flex items-center gap-1 ml-1">
                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); const updated = [...questions]; updated[i] = { ...q, aiMaxUses: Math.max(1, (q.aiMaxUses ?? 3) - 1) }; setQuestions(updated); }}
                                      className="w-5 h-5 flex items-center justify-center rounded bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-bold transition-colors">−</button>
                                    <span className="w-5 text-center text-xs font-bold text-violet-700">{q.aiMaxUses ?? 3}</span>
                                    <button type="button"
                                      onClick={(e) => { e.stopPropagation(); const updated = [...questions]; updated[i] = { ...q, aiMaxUses: Math.min(20, (q.aiMaxUses ?? 3) + 1) }; setQuestions(updated); }}
                                      className="w-5 h-5 flex items-center justify-center rounded bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-bold transition-colors">+</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Problem Statement</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{q.description}</p>
                          </div>

                          {/* MCQ options view */}
                          {q.type === "MCQ" && (
                            <div>
                              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Answer Options</p>
                              <div className="space-y-2">
                                {q.options.map((opt, oi) => {
                                  const letter = String.fromCharCode(65 + oi);
                                  const isCorrect = q.testCases[0]?.expectedOutput === letter;
                                  return (
                                    <div key={oi} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                                      isCorrect
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                        : "bg-slate-50 border-gray-100 text-gray-700"
                                    }`}>
                                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                                        isCorrect ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                                      }`}>
                                        {letter}
                                      </span>
                                      <span className="flex-1">{opt || <span className="text-gray-300 italic">empty</span>}</span>
                                      {isCorrect && (
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1">
                                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                          </svg>
                                          Correct
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* CODING test cases */}
                          {q.type === "CODING" && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                                  Test Cases
                                  <span className="ml-2 normal-case font-normal text-gray-400">
                                    {visibleTc.length} shown · <span className="text-amber-500">{hiddenCount} hidden</span>
                                  </span>
                                </p>
                                <button type="button"
                                  onClick={() => {
                                    const updated = [...questions];
                                    updated[i] = { ...q, testCases: [...q.testCases, { input: "", expectedOutput: "", isHidden: false }] };
                                    setQuestions(updated);
                                  }}
                                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add Test Case
                                </button>
                              </div>
                              <div className="space-y-2">
                                {q.testCases.map((tc, ti) => (
                                  <div key={ti} className={`rounded-lg border overflow-hidden text-xs ${tc.isHidden ? "border-amber-200 bg-amber-50/40" : "border-gray-100 bg-slate-50"}`}>
                                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-inherit">
                                      <div className="flex items-center gap-2">
                                        <span className="font-sans text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Test Case {ti + 1}</span>
                                        {tc.isHidden && (
                                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded border border-amber-200">Hidden</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-1 cursor-pointer select-none font-sans text-[10px] text-gray-500">
                                          <input type="checkbox" checked={tc.isHidden}
                                            onChange={(e) => {
                                              const updated = [...questions];
                                              const tcs = [...q.testCases];
                                              tcs[ti] = { ...tc, isHidden: e.target.checked };
                                              updated[i] = { ...q, testCases: tcs };
                                              setQuestions(updated);
                                            }}
                                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-400 h-3 w-3" />
                                          Hide from students
                                        </label>
                                        {q.testCases.length > 2 && (
                                          <button type="button"
                                            onClick={() => {
                                              const updated = [...questions];
                                              updated[i] = { ...q, testCases: q.testCases.filter((_, idx) => idx !== ti) };
                                              setQuestions(updated);
                                            }}
                                            className="text-gray-300 hover:text-red-500 transition-colors">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-px bg-gray-100">
                                      <div className="bg-white px-3 py-2">
                                        <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wide mb-1">Input</p>
                                        <textarea rows={Math.max(2, tc.input.split("\n").length)}
                                          value={tc.input}
                                          onChange={(e) => {
                                            const updated = [...questions];
                                            const tcs = [...q.testCases];
                                            tcs[ti] = { ...tc, input: e.target.value };
                                            updated[i] = { ...q, testCases: tcs };
                                            setQuestions(updated);
                                          }}
                                          className="w-full font-mono text-xs text-gray-800 bg-transparent resize-none focus:outline-none placeholder-gray-300"
                                          placeholder="stdin input…" />
                                      </div>
                                      <div className="bg-white px-3 py-2">
                                        <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wide mb-1">Expected Output</p>
                                        <textarea rows={Math.max(2, tc.expectedOutput.split("\n").length)}
                                          value={tc.expectedOutput}
                                          onChange={(e) => {
                                            const updated = [...questions];
                                            const tcs = [...q.testCases];
                                            tcs[ti] = { ...tc, expectedOutput: e.target.value };
                                            updated[i] = { ...q, testCases: tcs };
                                            setQuestions(updated);
                                          }}
                                          className="w-full font-mono text-xs text-gray-800 bg-transparent resize-none focus:outline-none placeholder-gray-300"
                                          placeholder="expected stdout…" />
                                      </div>
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
            </div>
          )}

          {/* Question Builder */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-slide-up delay-100">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-base font-semibold text-gray-900">
                {questions.length > 0 ? "Add Another Question" : "Add Question"}
              </h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={openBank}
                  className="flex items-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-medium rounded-lg transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Question Bank
                </button>
                <button type="button" onClick={openSaveModal}
                  disabled={!qValid(currentQuestion)}
                  className="flex items-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save to Bank
                </button>
                <button type="button" onClick={addQuestion}
                  disabled={!qValid(currentQuestion)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to List
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Type selector + title + score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Title</label>
                  <input type="text"
                    placeholder={currentQuestion.type === "MCQ" ? "e.g. Which data structure uses LIFO order?" : "e.g. Implement Binary Search"}
                    value={currentQuestion.title}
                    onChange={e => setCurrentQuestion(q => ({ ...q, title: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                  <input type="number" min="1" max="100" value={currentQuestion.score}
                    onChange={e => setCurrentQuestion(q => ({ ...q, score: parseInt(e.target.value) || 10 }))} className={inputClass} />
                </div>
              </div>

              {/* Question type pills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <div className="flex items-center gap-2">
                  {(["CODING", "MCQ"] as QuestionType[]).map((t) => (
                    <button key={t} type="button"
                      onClick={() => setCurrentQuestion(q => ({ ...q, type: t }))}
                      className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all uppercase tracking-wide ${
                        currentQuestion.type === t
                          ? QUESTION_TYPE_STYLE[t]
                          : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                      }`}>
                      {QUESTION_TYPE_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
                <textarea rows={3} placeholder="Detailed problem statement with constraints and examples..."
                  value={currentQuestion.description}
                  onChange={e => setCurrentQuestion(q => ({ ...q, description: e.target.value }))}
                  className={inputClass + " resize-none"} />
              </div>

              {/* AI Generate */}
              <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <svg className="h-3.5 w-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Generate with AI</p>
                      <p className="text-xs text-gray-400">Fills title, function signature, and test cases from your description</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={aiGenerating}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {aiGenerating ? (
                      <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Generating…</>
                    ) : (
                      <><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Generate</>
                    )}
                  </button>
                </div>
                {aiError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{aiError}</p>
                )}
              </div>

              {/* Function Signature — CODING only */}
              {currentQuestion.type === "CODING" && (
                <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Function Signature <span className="text-xs font-normal text-gray-400 ml-1">optional</span></p>
                      <p className="text-xs text-gray-400 mt-0.5">Define a function — students implement it, you pass args as test inputs</p>
                    </div>
                    {currentQuestion.functionName && (
                      <button type="button"
                        onClick={() => setCurrentQuestion(q => ({ ...q, functionName: undefined, parameters: undefined, returnType: undefined }))}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Function Name</label>
                      <input type="text" placeholder="e.g. findMaximum"
                        value={currentQuestion.functionName ?? ""}
                        onChange={e => setCurrentQuestion(q => ({ ...q, functionName: e.target.value || undefined }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Return Type</label>
                      <select
                        value={currentQuestion.returnType ?? ""}
                        onChange={e => setCurrentQuestion(q => ({ ...q, returnType: e.target.value || undefined }))}
                        className={inputClass}>
                        <option value="">Select type…</option>
                        {["number","string","boolean","number[]","string[]","number[][]","string[][]"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Parameters */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-xs font-medium text-gray-500">Parameters</label>
                      <button type="button"
                        onClick={() => setCurrentQuestion(q => ({ ...q, parameters: [...(q.parameters ?? []), { name: "", type: "number" }] }))}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add
                      </button>
                    </div>
                    {(currentQuestion.parameters ?? []).length === 0 && (
                      <p className="text-xs text-gray-300 italic">No parameters yet</p>
                    )}
                    <div className="space-y-2">
                      {(currentQuestion.parameters ?? []).map((p, pi) => (
                        <div key={pi} className="flex items-center gap-2">
                          <input type="text" placeholder="name"
                            value={p.name}
                            onChange={e => {
                              const params = [...(currentQuestion.parameters ?? [])];
                              params[pi] = { ...p, name: e.target.value };
                              setCurrentQuestion(q => ({ ...q, parameters: params }));
                            }}
                            className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300" />
                          <select value={p.type}
                            onChange={e => {
                              const params = [...(currentQuestion.parameters ?? [])];
                              params[pi] = { ...p, type: e.target.value };
                              setCurrentQuestion(q => ({ ...q, parameters: params }));
                            }}
                            className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {["number","string","boolean","number[]","string[]","number[][]","string[][]"].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <button type="button"
                            onClick={() => {
                              const params = (currentQuestion.parameters ?? []).filter((_, idx) => idx !== pi);
                              setCurrentQuestion(q => ({ ...q, parameters: params.length ? params : undefined }));
                            }}
                            className="p-1.5 text-gray-300 hover:text-red-500 rounded transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code preview */}
                  {currentQuestion.functionName && (
                    <div className="bg-gray-900 rounded-lg px-4 py-3 mt-1">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Student sees</p>
                      <code className="text-sm font-mono">
                        <span className="text-blue-400">function </span>
                        <span className="text-yellow-300">{currentQuestion.functionName}</span>
                        <span className="text-gray-300">(</span>
                        <span className="text-orange-300">
                          {(currentQuestion.parameters ?? []).map(p => p.name).join(", ")}
                        </span>
                        <span className="text-gray-300">) {"{"}</span>
                        <span className="text-gray-500"> … </span>
                        <span className="text-gray-300">{"}"}</span>
                      </code>
                    </div>
                  )}
                </div>
              )}

              {/* MCQ Options */}
              {currentQuestion.type === "MCQ" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Answer Options
                      <span className="ml-1 text-xs font-normal text-gray-400">(mark the correct one with ✓)</span>
                    </label>
                    <button type="button"
                      onClick={() => setCurrentQuestion(q => ({ ...q, options: [...q.options, ""] }))}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex-shrink-0">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <input type="text" placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          value={opt}
                          onChange={e => {
                            const opts = [...currentQuestion.options];
                            opts[oi] = e.target.value;
                            setCurrentQuestion(q => ({ ...q, options: opts }));
                          }}
                          className={inputClass + " flex-1"} />
                        <button type="button"
                          onClick={() => {
                            const tcs = [{ input: "", expectedOutput: String.fromCharCode(65 + oi), isHidden: false }];
                            setCurrentQuestion(q => ({ ...q, testCases: tcs }));
                          }}
                          title="Mark as correct answer"
                          className={`p-1.5 rounded-lg border transition-all text-sm ${
                            currentQuestion.testCases[0]?.expectedOutput === String.fromCharCode(65 + oi)
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-400 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                          }`}>
                          ✓
                        </button>
                        {currentQuestion.options.length > 2 && (
                          <button type="button"
                            onClick={() => {
                              const opts = currentQuestion.options.filter((_, idx) => idx !== oi);
                              const correctLetter = currentQuestion.testCases[0]?.expectedOutput;
                              const removedLetter = String.fromCharCode(65 + oi);
                              const newTcs = correctLetter === removedLetter
                                ? [{ input: "", expectedOutput: "", isHidden: false }]
                                : currentQuestion.testCases;
                              setCurrentQuestion(q => ({ ...q, options: opts, testCases: newTcs }));
                            }}
                            className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                            title="Remove option">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Assistant toggle — CODING only */}
              {currentQuestion.type === "CODING" && (
                <div className="px-4 py-3 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Enable AI Assistant</p>
                        <p className="text-xs text-gray-400 mt-0.5">Students can ask an AI for hints — it will never give code solutions</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentQuestion(q => ({ ...q, aiEnabled: !q.aiEnabled }))}
                      className={`relative inline-flex flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                        currentQuestion.aiEnabled ? "bg-violet-500" : "bg-gray-300"
                      }`}
                    >
                      <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        currentQuestion.aiEnabled ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                  {currentQuestion.aiEnabled && (
                    <div className="flex items-center gap-3 pt-1 border-t border-violet-100">
                      <p className="text-xs font-medium text-violet-700 flex-1">Max AI hints per student</p>
                      <div className="flex items-center gap-2">
                        <button type="button"
                          onClick={() => setCurrentQuestion(q => ({ ...q, aiMaxUses: Math.max(1, (q.aiMaxUses ?? 3) - 1) }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold text-sm transition-colors">
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-violet-800">
                          {currentQuestion.aiMaxUses ?? 3}
                        </span>
                        <button type="button"
                          onClick={() => setCurrentQuestion(q => ({ ...q, aiMaxUses: Math.min(20, (q.aiMaxUses ?? 3) + 1) }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold text-sm transition-colors">
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Test Cases — only for CODING */}
              {currentQuestion.type === "CODING" && <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Test Cases</label>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {currentQuestion.functionName
                        ? <>Arguments as JSON — e.g. <code className="font-mono bg-gray-100 px-1 rounded">[[3,7,1,9,4]]</code> or <code className="font-mono bg-gray-100 px-1 rounded">[[1,3,5],7]</code></>
                        : "Each line in stdin is a separate input line passed to your program"}
                    </p>
                  </div>
                  <button type="button" onClick={addTestCase}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Test Case
                  </button>
                </div>
                <div className="space-y-3">
                  {currentQuestion.testCases.map((tc, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl border border-gray-100 overflow-hidden animate-fade-in">
                      {/* Card header */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-xs font-semibold text-gray-600">Test Case {i + 1}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 cursor-pointer select-none">
                            <input type="checkbox" checked={tc.isHidden}
                              onChange={e => updateTestCase(i, "isHidden", e.target.checked)}
                              className="h-3.5 w-3.5 rounded accent-indigo-600" />
                            Hidden
                            <span className="text-gray-400 font-normal">(not shown to students)</span>
                          </label>
                          {currentQuestion.testCases.length > 2 && (
                            <button type="button" onClick={() => removeTestCase(i)}
                              className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Input / Output textareas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
                        <div className="bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                            {currentQuestion.functionName ? "Arguments (JSON)" : "stdin / Input"}
                          </p>
                          <textarea
                            rows={3}
                            placeholder={currentQuestion.functionName
                              ? `e.g.\n[5]              → single number\n[[3,7,1,9,4]]    → single list\n[[1,3,5],7]      → list + number`
                              : "e.g.\n5\n1 2 3 4 5"}
                            value={tc.input}
                            onChange={e => updateTestCase(i, "input", e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-y placeholder-gray-300"
                            spellCheck={false}
                          />
                        </div>
                        <div className="bg-slate-50 p-3">
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                            Expected Output
                          </p>
                          <textarea
                            rows={3}
                            placeholder={"e.g.\n15"}
                            value={tc.expectedOutput}
                            onChange={e => updateTestCase(i, "expectedOutput", e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-y placeholder-gray-300"
                            spellCheck={false}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>}

            </div>
          </div>

          {/* Submit */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">{error}</div>
          )}
          <div className="flex items-center justify-between">
            {!canSubmit && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Fill in at least one question to continue
              </p>
            )}
            <div className="ml-auto flex items-center gap-3">
              <Link href={`/faculty/classroom/${classroomId}`}
                className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </Link>
              <button type="submit" disabled={!canSubmit || submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                {submitting ? "Creating..." : "Create Session"}
              </button>
            </div>
          </div>
        </form>
      </div>
      {/* Question Bank slide-in panel */}
      {showBank && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowBank(false)} />

          <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-slide-in-right">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {selectedBankTag && (
                  <button type="button" onClick={() => { setSelectedBankTag(null); setBankFilter("All"); setBankTypeFilter("All"); setBankSearch(""); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {selectedBankTag
                      ? (banks.find((b) => b.tag === selectedBankTag)?.label ?? selectedBankTag)
                      : "Question Bank"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedBankTag
                      ? (banks.find((b) => b.tag === selectedBankTag)?.description ?? "")
                      : `${banks.length} categories available`}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setShowBank(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── Category list ── */}
            {!selectedBankTag && (
              <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-5 py-3 border-b border-gray-100">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input type="text" placeholder="Search categories…"
                      value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {banks
                  .filter((b) =>
                    !categorySearch.trim() ||
                    b.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
                    b.tag.toLowerCase().includes(categorySearch.toLowerCase()) ||
                    b.description.toLowerCase().includes(categorySearch.toLowerCase())
                  )
                  .map((bank) => (
                  <button key={bank.tag} type="button"
                    onClick={() => setSelectedBankTag(bank.tag)}
                    className="w-full text-left rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm transition-all p-4 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${BANK_TAG_STYLE[bank.tag] ?? "bg-gray-100 text-gray-600"}`}>
                          {bank.tag}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{bank.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{bank._count.questions} questions</p>
                        </div>
                      </div>
                      <svg className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-[calc(2.5rem+0.75rem)]">{bank.description}</p>
                  </button>
                ))}
                </div>
              </div>
            )}

            {/* ── Question list within a category ── */}
            {selectedBankTag && (
              <>
                {/* Search + filter */}
                <div className="px-5 py-3 border-b border-gray-100 space-y-2.5">
                  <input type="text" placeholder="Search by title or tag…"
                    value={bankSearch} onChange={(e) => setBankSearch(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400" />
                  <div className="flex items-center gap-2 flex-wrap">
                    {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
                      <button key={d} type="button" onClick={() => setBankFilter(d)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                          bankFilter === d ? "bg-indigo-600 text-white border-indigo-600" : "text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                        }`}>
                        {d}
                      </button>
                    ))}
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    {(["All", "CODING", "MCQ"] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setBankTypeFilter(t)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                          bankTypeFilter === t
                            ? t === "MCQ"
                              ? "bg-amber-500 text-white border-amber-500"
                              : t === "CODING"
                              ? "bg-indigo-500 text-white border-indigo-500"
                              : "bg-gray-700 text-white border-gray-700"
                            : "text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                        }`}>
                        {t === "All" ? "All Types" : t === "CODING" ? "Coding" : "MCQ"}
                      </button>
                    ))}
                    <span className="ml-auto text-xs text-gray-400">{filteredBankQuestions.length} shown</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                  {bankLoading && (
                    <p className="text-center text-sm text-gray-400 py-12">Loading questions…</p>
                  )}
                  {!bankLoading && filteredBankQuestions.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-12">No questions match your filter.</p>
                  )}
                  {!bankLoading && filteredBankQuestions.map((q) => {
                    const isAdded = addedFromBank.has(q.id) || questions.some((e) => e.title === q.title);
                    return (
                      <div key={q.id}
                        className={`rounded-xl border p-4 transition-all ${isAdded ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100 hover:border-indigo-200 hover:shadow-sm"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLE[q.difficulty]}`}>
                                {q.difficulty}
                              </span>
                              {q.type === "MCQ" && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-200">MCQ</span>
                              )}
                              <span className="text-[11px] text-gray-400">{q.defaultScore} pts</span>
                              {q.type !== "MCQ" && (
                                <span className="text-[11px] text-gray-400">· {q.testCases.length} tc ({q.testCases.filter(t => t.isHidden).length} hidden)</span>
                              )}
                              {q.type === "MCQ" && (
                                <span className="text-[11px] text-gray-400">· {(q.options ?? []).length} options</span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{q.title}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {q.tags.map((tag) => (
                                <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">{tag}</span>
                              ))}
                              {q.authorLabel && (
                                <span className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-md">by {q.authorLabel}</span>
                              )}
                            </div>
                          </div>
                          <button type="button" onClick={() => addFromBank(q)} disabled={isAdded}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                              isAdded ? "bg-indigo-100 text-indigo-500 cursor-default" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            }`}>
                            {isAdded ? (
                              <><svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Added</>
                            ) : (
                              <><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add</>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{addedFromBank.size}</span> question{addedFromBank.size !== 1 ? "s" : ""} added from bank
              </p>
              <button type="button" onClick={() => setShowBank(false)}
                className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save to Bank Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Save Question to Bank</h3>
              <button onClick={() => setShowSaveModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
              <button type="button" onClick={() => setSaveMode("existing")}
                className={`flex-1 py-2 transition-colors ${saveMode === "existing" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                Existing Category
              </button>
              <button type="button" onClick={() => setSaveMode("new")}
                className={`flex-1 py-2 transition-colors ${saveMode === "new" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                New Category
              </button>
            </div>

            {saveMode === "existing" ? (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Select Category</label>
                <select value={saveTag} onChange={e => setSaveTag(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {banks.map(b => (
                    <option key={b.tag} value={b.tag}>{b.label} ({b.tag})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Category Name</label>
                  <input type="text" placeholder="e.g. System Design" value={saveLabel}
                    onChange={e => setSaveLabel(e.target.value)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Description <span className="text-gray-400">(optional)</span></label>
                  <input type="text" placeholder="Short description of this category" value={saveDesc}
                    onChange={e => setSaveDesc(e.target.value)}
                    className={inputClass} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Difficulty</label>
                <select value={saveDifficulty} onChange={e => setSaveDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tags <span className="text-gray-400">(comma separated)</span></label>
                <input type="text" placeholder="e.g. Array, DP" value={saveTags}
                  onChange={e => setSaveTags(e.target.value)}
                  className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Author Label <span className="text-gray-400">(optional — your name or credit)</span>
              </label>
              <input type="text" placeholder="e.g. Prof. Sharma" value={saveAuthor}
                onChange={e => setSaveAuthor(e.target.value)}
                className={inputClass} />
            </div>

            {saveError && <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{saveError}</p>}
            {saveSuccess && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">{saveSuccess}</p>}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleSaveToBank} disabled={saving}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save to Bank"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
