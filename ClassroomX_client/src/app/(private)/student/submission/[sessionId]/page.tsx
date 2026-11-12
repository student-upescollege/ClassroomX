"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useAuth } from "@/components/auth-provider";
import { API_URL } from "@/lib/api";

interface TestResultItem {
  testCaseId: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden: boolean;
  error?: string;
}

interface Submission {
  id: number;
  createdAt: string;
  sessionId: number;
  studentId: number;
  questionId: number;
  code: string;
  language: string;
  output: string | null;
  error: string | null;
  isSuccessful: boolean;
  score: number;
  testResults: TestResultItem[] | null;
  question: {
    id: number;
    title: string;
    description: string;
    score: number;
  };
}

interface SessionQuestion {
  id: number;
  title: string;
  description: string;
  score: number;
  type: "CODING" | "MCQ" | "DESCRIPTIVE";
  options?: string[];
}

interface SessionData {
  id: number;
  classroomId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  totalScore: number;
  showResultsImmediately: boolean;
  questions: SessionQuestion[];
  submissions: Submission[];
}

export default function SubmissionViewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const sessionId = React.use(params).sessionId;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [viewingCodeFor, setViewingCodeFor] = useState<number | null>(null);

  const fetchSessionSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/signin");
        return;
      }
      const response = await axios.get(
        `${API_URL}/student/session/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSession(response.data);
      if (response.data.questions?.length > 0) {
        setExpandedQuestion(response.data.questions[0].id);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessionSubmissions(); }, [sessionId]);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePop = () => { router.replace('/student/dashboard'); };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-violet-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading results…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-500">Session not found.</p>
      </div>
    );
  }

  const resultsHidden = !session.showResultsImmediately && session.isActive;
  const submissionByQuestion = new Map(session.submissions.map((s) => [s.questionId, s]));
  const totalEarned = session.submissions.reduce((s, sub) => s + sub.score, 0);
  const submittedCount = session.submissions.length;
  const totalQuestions = session.questions?.length ?? 0;
  const pct = session.totalScore > 0 ? Math.round((totalEarned / session.totalScore) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-violet-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={`/student/course/${session.classroomId}`}
            className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="bg-white text-violet-700 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm">ACL</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-none truncate">{session.title}</h1>
            <p className="text-violet-300 text-xs mt-0.5">Submission Results</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-violet-300 text-xs">Total Score</p>
            <p className="text-2xl font-bold">
              {resultsHidden ? "—" : `${totalEarned} / ${session.totalScore}`}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Results hidden notice */}
        {resultsHidden ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-amber-800 mb-2">Results are locked</h2>
            <p className="text-sm text-amber-600">
              Your submission has been recorded. Results will be available once the session ends.
            </p>
          </div>
        ) : (
          <>
            {/* Score summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Session Summary</h2>
                <span className="text-xs text-gray-400">
                  {submittedCount} / {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} attempted
                </span>
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-4xl font-bold text-violet-600">{totalEarned}</p>
                  <p className="text-sm text-gray-400">out of {session.totalScore} pts</p>
                </div>
                <div className="flex-1 mb-1.5">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}% score</p>
                </div>
              </div>
            </div>

            {/* All questions */}
            <div className="space-y-4">
              {(session.questions ?? []).map((q, idx) => {
                const sub = submissionByQuestion.get(q.id) ?? null;
                return (
                  <QuestionResultCard
                    key={q.id}
                    question={q}
                    submission={sub}
                    index={idx}
                    isExpanded={expandedQuestion === q.id}
                    viewingCode={viewingCodeFor === q.id}
                    onToggle={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                    onViewCode={() => setViewingCodeFor(q.id)}
                    onCloseCode={() => setViewingCodeFor(null)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function QuestionResultCard({
  question,
  submission,
  index,
  isExpanded,
  viewingCode,
  onToggle,
  onViewCode,
  onCloseCode,
}: {
  question: SessionQuestion;
  submission: Submission | null;
  index: number;
  isExpanded: boolean;
  viewingCode: boolean;
  onToggle: () => void;
  onViewCode: () => void;
  onCloseCode: () => void;
}) {
  const allResults = submission?.testResults ?? null;
  const visibleResults = allResults?.filter((t) => !t.isHidden) ?? null;
  const hiddenResults = allResults?.filter((t) => t.isHidden) ?? null;
  const passedCount = allResults?.filter((t) => t.passed).length ?? 0;
  const totalCount = allResults?.length ?? 0;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const badgeColor = !submission
    ? "bg-gray-100 text-gray-500"
    : submission.isSuccessful
    ? "bg-emerald-100 text-emerald-700"
    : submission.score > 0
    ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-600";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div
        className="px-6 py-4 flex items-start justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${badgeColor}`}>
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{question.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {submission
                ? `${submission.language} · Submitted ${formatDate(submission.createdAt)}`
                : "Not attempted"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          {submission ? (
            <>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  submission.isSuccessful ? "text-emerald-600" : submission.score > 0 ? "text-amber-600" : "text-red-500"
                }`}>
                  {submission.score} / {question.score}
                </p>
                {allResults !== null && (
                  <p className="text-xs text-gray-400">{passedCount}/{totalCount} tests</p>
                )}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                submission.isSuccessful
                  ? "bg-emerald-50 text-emerald-700"
                  : submission.score > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-600"
              }`}>
                {submission.isSuccessful ? "Passed" : submission.score > 0 ? "Partial" : "Failed"}
              </span>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-400">0 / {question.score}</p>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                Skipped
              </span>
            </>
          )}
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {!submission ? (
            <div className="px-6 py-6 text-center">
              <p className="text-sm text-gray-400">This question was not attempted.</p>
            </div>
          ) : question.type === "MCQ" ? (
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Answer</p>
              <div className="flex items-center gap-3">
                <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold border-2 ${
                  submission.isSuccessful
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : "bg-red-50 border-red-300 text-red-600"
                }`}>
                  {submission.output || "—"}
                </span>
                <span className={`text-sm font-medium ${submission.isSuccessful ? "text-emerald-600" : "text-red-500"}`}>
                  {submission.isSuccessful ? "Correct" : `Incorrect — correct answer: ${allResults?.[0]?.expectedOutput ?? "?"}`}
                </span>
              </div>
            </div>
          ) : question.type === "DESCRIPTIVE" ? (
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Answer</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-gray-100">
                {submission.output || <span className="text-gray-400 italic">No answer provided</span>}
              </p>
              <p className="text-xs text-gray-400 mt-2">Descriptive answers are reviewed manually by the faculty.</p>
            </div>
          ) : allResults !== null && allResults.length > 0 ? (
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Test Cases</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 font-medium">{passedCount} passed</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-red-500 font-medium">{totalCount - passedCount} failed</span>
                </div>
              </div>

              {visibleResults && visibleResults.length > 0 && (
                <div className="space-y-2 mb-3">
                  {visibleResults.map((tc, i) => (
                    <TestCaseRow key={tc.testCaseId} result={tc} index={i} />
                  ))}
                </div>
              )}

              {hiddenResults && hiddenResults.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Hidden Test Cases ({hiddenResults.length})</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {hiddenResults.map((tc) => (
                      <div
                        key={tc.testCaseId}
                        title={tc.passed ? "Passed" : tc.error || "Failed"}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium ${
                          tc.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {tc.passed ? "✓" : "✗"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-4">
              {(submission.output || submission.error) && (
                <div className="space-y-3">
                  {submission.output && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Output</p>
                      <pre className="bg-slate-50 rounded-lg p-3 text-xs text-gray-700 overflow-x-auto">{submission.output}</pre>
                    </div>
                  )}
                  {submission.error && (
                    <div>
                      <p className="text-xs font-medium text-red-500 mb-1">Error</p>
                      <pre className="bg-red-50 rounded-lg p-3 text-xs text-red-700 overflow-x-auto">{submission.error}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {submission && question.type === "CODING" && (
            <>
              <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between bg-slate-50">
                <p className="text-xs text-gray-400">
                  {submission.language} · {submission.code.split("\n").length} lines
                </p>
                <button
                  onClick={viewingCode ? onCloseCode : onViewCode}
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  {viewingCode ? "Hide code" : "View code"}
                </button>
              </div>

              {viewingCode && (
                <div className="h-80 border-t border-gray-100">
                  <Editor
                    height="100%"
                    language={submission.language === "c" ? "c" : submission.language}
                    value={submission.code}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      wordWrap: "on",
                      domReadOnly: true,
                      renderValidationDecorations: "off",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TestCaseRow({ result, index }: { result: TestResultItem; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border transition-colors ${
      result.passed ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/50"
    }`}>
      <button
        className="w-full px-4 py-2.5 flex items-center gap-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
          result.passed ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {result.passed ? "✓" : "✗"}
        </span>
        <span className="text-sm font-medium text-gray-700">Test Case {index + 1}</span>
        <span className={`ml-auto text-xs font-medium ${result.passed ? "text-emerald-600" : "text-red-500"}`}>
          {result.passed ? "Passed" : "Failed"}
        </span>
        <svg
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1 font-medium">Input</p>
            <pre className="bg-white rounded-lg p-2 text-xs text-gray-700 overflow-x-auto border border-gray-100">{result.input}</pre>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1 font-medium">Expected</p>
            <pre className="bg-white rounded-lg p-2 text-xs text-emerald-700 overflow-x-auto border border-gray-100">{result.expectedOutput}</pre>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1 font-medium">Your Output</p>
            <pre className={`bg-white rounded-lg p-2 text-xs overflow-x-auto border ${
              result.passed ? "text-emerald-700 border-gray-100" : "text-red-600 border-red-100"
            }`}>
              {result.actualOutput || result.error || "(no output)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
