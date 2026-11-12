"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Editor from "@monaco-editor/react";
import Split from "react-split";
import { useAuth } from "@/components/auth-provider";
import ProctorSystem from "@/components/ProctorSystem";
import { API_URL } from "@/lib/api";

interface TestCase {
  id: number;
  questionId: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

type QuestionType = "CODING" | "DESCRIPTIVE" | "MCQ";

interface Parameter {
  name: string;
  type: string;
}

interface Question {
  id: number;
  sessionId: number;
  title: string;
  description: string;
  score: number;
  type: QuestionType;
  options: string[];
  functionName?: string | null;
  parameters?: Parameter[] | null;
  returnType?: string | null;
  aiEnabled?: boolean;
  testCases: TestCase[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const Q_TYPE_STYLE: Record<QuestionType, string> = {
  CODING:      "bg-indigo-400/40 text-gray-900 border-indigo-400/60",
  DESCRIPTIVE: "bg-teal-400/40 text-gray-900 border-teal-400/60",
  MCQ:         "bg-amber-400/40 text-gray-900 border-amber-400/60",
};

const Q_TYPE_LABEL: Record<QuestionType, string> = {
  CODING: "Coding", DESCRIPTIVE: "Descriptive", MCQ: "MCQ",
};

interface Session {
  id: number;
  classroomId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  totalScore: number;
  questions: Question[];
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime?: string;
  memory?: string;
  error?: string;
}

interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
}

const LANGUAGE_CONFIGS = {
  javascript: { pistonLang: "javascript", version: "18.15.0" },
  python:     { pistonLang: "python",     version: "3.10.0"  },
  c:          { pistonLang: "c",          version: "10.2.0"  },
};

type LanguageKey = keyof typeof LANGUAGE_CONFIGS;

function toCamelCase(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w, i) => i === 0 ? w[0].toLowerCase() + w.slice(1) : w[0].toUpperCase() + w.slice(1))
    .join("");
}

function toSnakeCase(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map(w => w.toLowerCase())
    .join("_");
}

function generateCTemplate(title: string, params: Parameter[]): string {
  const lines = [`// ${title}`, "#include <stdio.h>", ""];
  lines.push("int main() {");
  for (const p of params) {
    if (p.type === "number[]") {
      lines.push(`    int ${p.name}_n;`);
      lines.push(`    scanf("%d", &${p.name}_n);`);
      lines.push(`    int ${p.name}[${p.name}_n];`);
      lines.push(`    for (int i = 0; i < ${p.name}_n; i++) scanf("%d", &${p.name}[i]);`);
    } else if (p.type === "number[][]") {
      lines.push(`    int ${p.name}_r;`);
      lines.push(`    scanf("%d", &${p.name}_r);`);
      lines.push(`    int ${p.name}[${p.name}_r][100];`);
      lines.push(`    for (int i = 0; i < ${p.name}_r; i++) {`);
      lines.push(`        int c; scanf("%d", &c);`);
      lines.push(`        for (int j = 0; j < c; j++) scanf("%d", &${p.name}[i][j]);`);
      lines.push(`    }`);
    } else if (p.type === "number") {
      lines.push(`    int ${p.name};`);
      lines.push(`    scanf("%d", &${p.name});`);
    } else if (p.type === "string") {
      lines.push(`    char ${p.name}[1000];`);
      lines.push(`    scanf("%s", ${p.name});`);
    }
    lines.push("");
  }
  lines.push("    // Your code here");
  lines.push("    // printf(\"result\\n\");");
  lines.push("    return 0;");
  lines.push("}");
  return lines.join("\n");
}

function getDefaultCode(
  language: LanguageKey,
  title: string,
  functionName?: string | null,
  parameters?: Parameter[] | null,
): string {
  if (language === "c") {
    if (functionName && parameters?.length) {
      return generateCTemplate(title, parameters);
    }
    return `// ${title}\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`;
  }

  if (!functionName) {
    const camel = toCamelCase(title) || "solution";
    const snake = toSnakeCase(title) || "solution";
    if (language === "javascript") {
      return `// ${title}\n\nfunction ${camel}() {\n  // Your code here\n}\n\n${camel}();`;
    }
    return `# ${title}\n\ndef ${snake}():\n    # Your code here\n    pass\n\n${snake}()`;
  }

  const paramList = parameters?.map((p) => p.name).join(", ") ?? "";
  if (language === "javascript") {
    return `// ${title}\n\nfunction ${functionName}(${paramList}) {\n  // Your code here\n}`;
  }
  const snakeFn = functionName.replace(/([A-Z])/g, "_\$1").toLowerCase().replace(/^_/, "");
  return `# ${title}\n\ndef ${snakeFn}(${paramList}):\n    # Your code here\n    pass`;
}

function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

const LANG_LABELS: Record<LanguageKey, string> = {
  javascript: "JavaScript",
  python: "Python",
  c: "C",
};

export default function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const sessionId = React.use(params).sessionId;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>("javascript");
  const [code, setCode] = useState<Record<number, Record<LanguageKey, string>>>({});
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"description" | "results">("description");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
  const [availableRuntimes, setAvailableRuntimes] = useState<PistonRuntime[]>([]);
  const [descriptiveAnswer, setDescriptiveAnswer] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<Record<number, string>>({});
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<Record<number, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState<Record<number, { usesRemaining: number; aiMaxUses: number }>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const editorRef = useRef<any>(null);
  const proctorBuffer = useRef<{ type: string; timestamp: string; content?: string }[]>([]);

  const fetchSession = async () => {
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
      const initialCode: Record<number, Record<LanguageKey, string>> = {};
      response.data.questions.forEach((q: Question) => {
        initialCode[q.id] = {
          javascript: getDefaultCode("javascript", q.title, q.functionName, q.parameters),
          python:     getDefaultCode("python",     q.title, q.functionName, q.parameters),
          c:          getDefaultCode("c",          q.title, q.functionName, q.parameters),
        };
      });
      setCode(initialCode);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching session:", error);
      setLoading(false);
    }
  };

  const calculateTimeRemaining = () => {
    if (!session) return;
    const now = new Date().getTime();
    const end = new Date(session.endTime).getTime();
    const diff = end - now;
    if (diff <= 0) {
      setTimeRemaining("Session Ended");
      return;
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
  };

  const executeCode = async (
    lang: LanguageKey,
    userCode: string,
    stdin: string,
    question?: Question,
  ) => {
    const token = localStorage.getItem("access_token");
    const body: Record<string, unknown> = { language: lang, code: userCode, stdin };
    if (question?.functionName) {
      body.functionName = question.functionName;
      if (question.parameters) body.parameters = question.parameters;
      if (question.returnType)  body.returnType  = question.returnType;
    }
    const response = await axios.post(
      `${API_URL}/student/execute`,
      body,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data as { stdout: string; stderr: string; exitCode: number };
  };

  const handleRunCode = async () => {
    if (!session || !session.questions[currentQuestionIndex]) return;
    const currentQuestion = session.questions[currentQuestionIndex];
    const currentCode = code[currentQuestion.id]?.[selectedLanguage] || "";
    if (!currentCode.trim()) return;

    setIsRunning(true);
    setTestResults([]);
    setActiveTab("results");

    try {
      const visibleTestCases = currentQuestion.testCases.filter((tc) => !tc.isHidden);
      const results: TestResult[] = [];

      for (const testCase of visibleTestCases) {
        try {
          const result = await executeCode(selectedLanguage, currentCode, testCase.input, currentQuestion);
          const output = normalizeOutput(result.stdout);
          const expected = normalizeOutput(testCase.expectedOutput);
          results.push({
            input: testCase.input,
            expectedOutput: expected,
            actualOutput: output,
            passed: output === expected,
            executionTime: result.exitCode === 0 ? "Success" : "Error",
            error: result.stderr || undefined,
          });
        } catch {
          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: "",
            passed: false,
            error: "Execution failed",
          });
        }
      }
      setTestResults(results);
    } catch (error) {
      console.error("Error running code:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!session || !session.questions[currentQuestionIndex]) return;
    const currentQuestion = session.questions[currentQuestionIndex];
    const currentCode = code[currentQuestion.id]?.[selectedLanguage] || "";
    if (!currentCode.trim()) return;
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    if (!session || !session.questions[currentQuestionIndex]) return;
    const currentQuestion = session.questions[currentQuestionIndex];
    setShowSubmitModal(false);
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");

      if (currentQuestion.type === "MCQ") {
        const selected = selectedOption[currentQuestion.id] ?? "";
        const testCase = currentQuestion.testCases[0];
        const passed = testCase
          ? normalizeOutput(selected) === normalizeOutput(testCase.expectedOutput)
          : false;
        const score = passed ? currentQuestion.score : 0;
        const testResults = testCase
          ? [{ testCaseId: testCase.id, input: testCase.input, expectedOutput: testCase.expectedOutput, actualOutput: selected, passed, isHidden: testCase.isHidden }]
          : [];

        await axios.post(
          `${API_URL}/student/session/${sessionId}/submit`,
          { questionId: currentQuestion.id, code: selected, language: "mcq", score, isSuccessful: passed, output: selected || null, error: null, testResults },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmittedQuestions((prev) => new Set(prev).add(currentQuestion.id));
        return;
      }

      if (currentQuestion.type === "DESCRIPTIVE") {
        const answer = descriptiveAnswer[currentQuestion.id] ?? "";
        await axios.post(
          `${API_URL}/student/session/${sessionId}/submit`,
          { questionId: currentQuestion.id, code: answer, language: "descriptive", score: 0, isSuccessful: false, output: answer || null, error: null, testResults: [] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmittedQuestions((prev) => new Set(prev).add(currentQuestion.id));
        return;
      }

      const currentCode = code[currentQuestion.id]?.[selectedLanguage] || "";
      const allTestCases = currentQuestion.testCases;
      let passedTests = 0;
      let output = "";
      let error = "";
      const submissionTestResults: Array<{
        testCaseId: number; input: string; expectedOutput: string;
        actualOutput: string; passed: boolean; isHidden: boolean; error?: string;
      }> = [];

      for (const testCase of allTestCases) {
        try {
          const result = await executeCode(selectedLanguage, currentCode, testCase.input, currentQuestion);
          const testOutput = normalizeOutput(result.stdout);
          const passed = testOutput === normalizeOutput(testCase.expectedOutput);
          if (passed) passedTests++;
          output = testOutput;
          if (result.stderr) error = result.stderr;
          submissionTestResults.push({ testCaseId: testCase.id, input: testCase.input, expectedOutput: normalizeOutput(testCase.expectedOutput), actualOutput: testOutput, passed, isHidden: testCase.isHidden, error: result.stderr || undefined });
        } catch {
          error = "Execution failed";
          submissionTestResults.push({ testCaseId: testCase.id, input: testCase.input, expectedOutput: testCase.expectedOutput, actualOutput: "", passed: false, isHidden: testCase.isHidden, error: "Execution failed" });
        }
      }

      const totalTests = allTestCases.length;
      const score = totalTests > 0 ? Math.round((passedTests / totalTests) * currentQuestion.score) : 0;
      const isSuccessful = passedTests === totalTests;

      await axios.post(
        `${API_URL}/student/session/${sessionId}/submit`,
        { questionId: currentQuestion.id, code: currentCode, language: selectedLanguage, score, isSuccessful, output: output || null, error: error || null, testResults: submissionTestResults },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmittedQuestions((prev) => new Set(prev).add(currentQuestion.id));
    } catch (error) {
      console.error("Error submitting solution:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!session || !session.questions[currentQuestionIndex] || value === undefined) return;
    const currentQuestion = session.questions[currentQuestionIndex];
    setCode((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        [selectedLanguage]: value,
      },
    }));
  };

  const handleLanguageChange = (newLanguage: LanguageKey) => {
    setSelectedLanguage(newLanguage);
    setTestResults([]);
  };

  const sendChat = async () => {
    if (!session || !chatInput.trim() || chatLoading) return;
    const qId = session.questions[currentQuestionIndex]?.id;
    if (!qId) return;

    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const history = chatHistory[qId] ?? [];
    setChatHistory(prev => ({ ...prev, [qId]: [...history, userMsg] }));
    setChatInput("");
    setChatLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post(
        `${API_URL}/student/session/${sessionId}/question/${qId}/ai-chat`,
        { message: userMsg.content, history },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const aiMsg: ChatMessage = { role: "assistant", content: res.data.reply };
      setChatHistory(prev => ({ ...prev, [qId]: [...(prev[qId] ?? []), aiMsg] }));
      if (res.data.usesRemaining !== undefined) {
        setAiUsage(prev => ({ ...prev, [qId]: { ...prev[qId], usesRemaining: res.data.usesRemaining } }));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Sorry, I couldn't get a response. Please try again.";
      const errMsg: ChatMessage = { role: "assistant", content: msg };
      setChatHistory(prev => ({ ...prev, [qId]: [...(prev[qId] ?? []), errMsg] }));
    } finally {
      setChatLoading(false);
    }
  };

  const pushProctorEvent = (type: string, content?: string) => {
    proctorBuffer.current.push({ type, timestamp: new Date().toISOString(), content });
  };

  const flushProctorEvents = async () => {
    if (!proctorBuffer.current.length) return;
    const token = localStorage.getItem("access_token");
    const events = [...proctorBuffer.current];
    proctorBuffer.current = [];
    try {
      await axios.post(
        `${API_URL}/student/session/${sessionId}/proctor`,
        { events },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      proctorBuffer.current = [...events, ...proctorBuffer.current];
    }
  };

  const handleHardAutoSubmit = async () => {
    pushProctorEvent("WINDOW_BLUR", "Exam Terminated: Maximum 5 proctoring violations reached.");
    await flushProctorEvents();
    router.replace(`/student/submission/${sessionId}`);
  };

  useEffect(() => {
    const onVisibilityChange = () => { if (document.hidden) pushProctorEvent("TAB_SWITCH"); };
    const onBlur = () => pushProctorEvent("WINDOW_BLUR");
    const onCopy = (e: ClipboardEvent) => {
      const text = (e.clipboardData?.getData("text/plain") || window.getSelection()?.toString() || "").slice(0, 1000);
      pushProctorEvent("COPY", text || undefined);
    };
    const onCut = (e: ClipboardEvent) => {
      const text = (e.clipboardData?.getData("text/plain") || window.getSelection()?.toString() || "").slice(0, 1000);
      pushProctorEvent("CUT", text || undefined);
    };
    const onPaste = (e: ClipboardEvent) => {
      const text = (e.clipboardData?.getData("text/plain") || "").slice(0, 1000);
      pushProctorEvent("PASTE", text || undefined);
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      pushProctorEvent("WINDOW_BLUR", "Blocked unauthorized right-click context menu attempt");
      flushProctorEvents();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // F12 Developer Tools
      if (e.key === "F12") {
        e.preventDefault();
        pushProctorEvent("WINDOW_BLUR", "Blocked F12 Developer Tools attempt");
        flushProctorEvents();
        return;
      }
      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
        e.preventDefault();
        pushProctorEvent("WINDOW_BLUR", "Blocked Inspect Element shortcut attempt");
        flushProctorEvents();
        return;
      }
      // Ctrl+U (View Page Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        pushProctorEvent("WINDOW_BLUR", "Blocked View Page Source attempt");
        flushProctorEvents();
        return;
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("cut", onCut, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("keydown", onKeyDown, true);

    const flushInterval = setInterval(flushProctorEvents, 15_000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("cut", onCut, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown, true);
      clearInterval(flushInterval);
      flushProctorEvents();
    };
  }, [sessionId]);

  useEffect(() => { fetchSession(); }, [sessionId]);

  useEffect(() => {
    if (session) {
      calculateTimeRemaining();
      const interval = setInterval(calculateTimeRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => { setTestResults([]); setActiveTab("description"); setShowChat(false); }, [currentQuestionIndex]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  useEffect(() => {
    if (!showChat || !session) return;
    const q = session.questions[currentQuestionIndex];
    if (!q?.aiEnabled || aiUsage[q.id] !== undefined) return;
    const token = localStorage.getItem("access_token");
    axios
      .get(`${API_URL}/student/session/${sessionId}/question/${q.id}/ai-usage`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(r => setAiUsage(prev => ({ ...prev, [q.id]: r.data })))
      .catch(() => {});
  }, [showChat, currentQuestionIndex, session]);

  const isEnded = timeRemaining === "Session Ended";
  const passedCount = testResults.filter((r) => r.passed).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading session…</p>
        </div>
      </div>
    );
  }

  if (!session || !session.questions || session.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Session not found or no questions available.</p>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const currentCode = code[currentQuestion.id]?.[selectedLanguage] || getDefaultCode(selectedLanguage, currentQuestion.title, currentQuestion.functionName, currentQuestion.parameters);
  const visibleTestCases = currentQuestion.testCases.filter((tc) => !tc.isHidden);

  return (
    <div className="h-screen flex flex-col relative" style={{ background: "#0f0f14" }}>
      {/* AI Proctoring & 5-Strike Auto-Submit Monitor */}
      <ProctorSystem
        sessionId={sessionId}
        onViolation={(type, details) => {
          pushProctorEvent(type, details);
          flushProctorEvents();
        }}
        onAutoSubmit={handleHardAutoSubmit}
      />

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 mx-auto mb-4">
              <svg className="h-6 w-6 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">Submit this question?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {submittedQuestions.has(session?.questions[currentQuestionIndex]?.id ?? -1)
                ? "You've already submitted this question. Re-submitting will overwrite your previous answer."
                : "Your code will be evaluated against all test cases including hidden ones."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish session modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 mx-auto mb-4">
              <svg className="h-6 w-6 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">Finish Session?</h3>
            {session && submittedQuestions.size < session.questions.length ? (
              <p className="text-sm text-amber-600 text-center mb-6 font-medium">
                {session.questions.length - submittedQuestions.size} of {session.questions.length} questions not yet submitted. Unsubmitted questions will be marked as not attempted.
              </p>
            ) : (
              <p className="text-sm text-gray-500 text-center mb-6">
                All questions submitted. You will be taken to your results.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => router.replace(`/student/submission/${sessionId}`)}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-white/10"
        style={{ background: "linear-gradient(90deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%)" }}>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs select-none">ACL</div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">{session.title}</h1>
              <p className="text-violet-300 text-xs mt-0.5">
                {session.questions.length} question{session.questions.length !== 1 ? "s" : ""} · {session.totalScore} pts total
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-white/20" />

          <button
            onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="hidden sm:flex items-center gap-1.5">
            {session.questions.map((q, idx) => {
              const isSubmitted = submittedQuestions.has(q.id);
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  title={isSubmitted ? "Submitted" : `Question ${idx + 1}`}
                  className={`relative w-7 h-7 rounded-md text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-white text-violet-700 shadow"
                      : isSubmitted
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {isSubmitted && !isCurrent ? (
                    <svg className="h-3.5 w-3.5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentQuestionIndex((i) => Math.min(session.questions.length - 1, i + 1))}
            disabled={currentQuestionIndex === session.questions.length - 1}
            className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
        {currentQuestion.type === "CODING" && currentQuestion.aiEnabled && (
          <button
            onClick={() => setShowChat(c => !c)}
            title="AI Assistant"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
              showChat
                ? "bg-violet-200 text-violet-800 border-violet-300"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Hint
            {aiUsage[currentQuestion.id] && (() => {
              const used = aiUsage[currentQuestion.id].aiMaxUses - aiUsage[currentQuestion.id].usesRemaining;
              return used > 0 ? (
                <span className="bg-violet-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {used}
                </span>
              ) : null;
            })()}
          </button>
        )}
        <button
          onClick={() => setShowFinishModal(true)}
          disabled={isEnded}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-40"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Finish Session
          {session && submittedQuestions.size > 0 && (
            <span className="ml-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {submittedQuestions.size}/{session.questions.length}
            </span>
          )}
        </button>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
          isEnded
            ? "bg-red-500/20 text-red-300 border border-red-500/30"
            : "bg-white/10 text-white border border-white/10"
        }`}>
          <svg className="h-3.5 w-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timeRemaining || "—"}
        </div>
        </div>
      </header>

      {/* Split pane + AI Sidebar */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden min-w-0">
        <Split
          className="flex h-full"
          sizes={[38, 62]}
          minSize={280}
          gutterSize={5}
          snapOffset={20}
          direction="horizontal"
          cursor="col-resize"
        >
          {/* Left: Question panel */}
          <div className="flex flex-col h-full bg-white overflow-hidden">
            <div className="flex-shrink-0 border-b border-gray-100 px-4 pt-3 pb-0 flex items-end gap-1">
              {(["description", "results"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 pb-2.5 pt-1 text-xs font-semibold capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-violet-600 text-violet-700"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                  {tab === "results" && testResults.length > 0 && (
                    <span className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                      passedCount === testResults.length ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {passedCount}/{testResults.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "description" && (
                <div className="p-5 space-y-5">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="text-lg font-bold text-gray-950 leading-snug">{currentQuestion.title}</h2>
                      <span className="flex-shrink-0 inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-violet-100">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {currentQuestion.score} pts
                      </span>
                    </div>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border mb-3 ${Q_TYPE_STYLE[currentQuestion.type ?? "CODING"]}`}>
                      {Q_TYPE_LABEL[currentQuestion.type ?? "CODING"]}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Problem Statement</p>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{currentQuestion.description}</p>
                  </div>

                  {currentQuestion.type === "MCQ" && currentQuestion.options?.filter(Boolean).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Choose your answer</p>
                      <div className="space-y-2">
                        {currentQuestion.options.filter(Boolean).map((opt, oi) => {
                          const letter = String.fromCharCode(65 + oi);
                          const isSelected = selectedOption[currentQuestion.id] === letter;
                          return (
                            <button key={oi} type="button"
                              onClick={() => setSelectedOption(s => ({ ...s, [currentQuestion.id]: letter }))}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "bg-violet-50 border-violet-300 text-violet-900"
                                  : "bg-white border-gray-200 text-gray-800 hover:border-violet-200 hover:bg-violet-50/50"
                              }`}>
                              <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold border transition-all ${
                                isSelected ? "bg-violet-600 text-white border-violet-600" : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}>{letter}</span>
                              <span className="text-sm font-medium">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === "DESCRIPTIVE" && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Answer</p>
                      <textarea
                        rows={8}
                        placeholder="Write your detailed answer here…"
                        value={descriptiveAnswer[currentQuestion.id] ?? ""}
                        onChange={e => setDescriptiveAnswer(a => ({ ...a, [currentQuestion.id]: e.target.value }))}
                        className="w-full px-4 py-3 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y placeholder-gray-300 leading-relaxed"
                      />
                    </div>
                  )}

                  {currentQuestion.type === "CODING" && visibleTestCases.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Sample Test Cases
                        <span className="ml-1.5 text-gray-400 normal-case font-normal">(visible)</span>
                      </p>
                      <div className="space-y-3">
                        {visibleTestCases.map((tc, idx) => (
                          <div key={tc.id} className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-white">
                              <span className="w-5 h-5 rounded-md bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-gray-700">Test Case {idx + 1}</span>
                            </div>
                            <div className="p-3 space-y-2.5">
                              <div>
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Input</p>
                                <pre className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-mono overflow-x-auto">
                                  {tc.input || <span className="text-gray-400 italic">empty</span>}
                                </pre>
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Expected Output</p>
                                <pre className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-mono overflow-x-auto">
                                  {tc.expectedOutput}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "results" && (
                <div className="p-5">
                  {isRunning ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="animate-spin h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full" />
                      <p className="text-sm text-gray-500">Running test cases…</p>
                    </div>
                  ) : testResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">No results yet</p>
                        <p className="text-xs text-gray-400 mt-0.5">Run your code to see test results</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                        passedCount === testResults.length
                          ? "bg-emerald-50 border border-emerald-100"
                          : "bg-red-50 border border-red-100"
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${passedCount === testResults.length ? "text-emerald-800" : "text-red-700"}`}>
                            {passedCount === testResults.length ? "All tests passed!" : `${passedCount} of ${testResults.length} passed`}
                          </span>
                        </div>
                      </div>

                      {testResults.map((result, idx) => (
                        <div key={idx} className={`rounded-xl border overflow-hidden ${
                          result.passed ? "border-emerald-100" : "border-red-100"
                        }`}>
                          <div className={`flex items-center gap-2 px-3 py-2 ${result.passed ? "bg-emerald-50" : "bg-red-50"}`}>
                            <span className={`text-xs font-semibold ${result.passed ? "text-emerald-800" : "text-red-700"}`}>
                              Test {idx + 1} — {result.passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                          <div className="p-3 bg-white space-y-2">
                            {[
                              { label: "Input", value: result.input },
                              { label: "Expected", value: result.expectedOutput },
                              { label: "Got", value: result.actualOutput || "No output" },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                                <pre className="text-xs text-gray-900 font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 overflow-x-auto">
                                  {value}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Code editor / Answer panel */}
          <div className="flex flex-col h-full" style={{ background: "#1e1e2e" }}>
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b"
              style={{ background: "#16161f", borderColor: "#2a2a3a" }}>
              <div className="flex items-center gap-2">
                {currentQuestion.type === "CODING" ? (
                  <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#2a2a3a" }}>
                    {(Object.keys(LANGUAGE_CONFIGS) as LanguageKey[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className="px-3 py-1.5 text-xs font-semibold transition-all"
                        style={{
                          background: selectedLanguage === lang ? "#7c3aed" : "transparent",
                          color: selectedLanguage === lang ? "#fff" : "#6b7280",
                        }}
                      >
                        {LANG_LABELS[lang]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded border ${Q_TYPE_STYLE[currentQuestion.type ?? "CODING"]}`}>
                    {Q_TYPE_LABEL[currentQuestion.type ?? "CODING"]}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentQuestion.type === "CODING" && (
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                  style={{ background: isRunning ? "#374151" : "#059669", color: "#fff" }}
                >
                  {isRunning ? "Running…" : "Run"}
                </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isEnded}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                  style={{
                    background: isSubmitting || isEnded ? "#374151" : submittedQuestions.has(currentQuestion.id) ? "#065f46" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "#fff",
                  }}
                >
                  {isSubmitting ? "Submitting…" : submittedQuestions.has(currentQuestion.id) ? "Re-submit" : "Submit"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {currentQuestion.type === "CODING" ? (
                <Editor
                  height="100%"
                  language={selectedLanguage === "c" ? "c" : selectedLanguage}
                  value={currentCode}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                    padding: { top: 12 },
                  }}
                  onMount={(editor) => { editorRef.current = editor; }}
                />
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center max-w-sm">
                    <p className="text-sm font-semibold text-white/70 mb-1">
                      {currentQuestion.type === "MCQ" ? "Multiple Choice Question" : "Descriptive Question"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Split>
        </div>

        {/* AI Sidebar */}
        {showChat && currentQuestion.type === "CODING" && currentQuestion.aiEnabled && (
          <div
            className="flex flex-col border-l flex-shrink-0"
            style={{ width: "360px", background: "#1a1a2e", borderColor: "rgba(124,58,237,0.3)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "rgba(124,58,237,0.25)", background: "linear-gradient(90deg,#4c1d95,#6d28d9)" }}>
              <p className="text-xs font-bold text-white leading-none">AI Assistant</p>
              <button onClick={() => setShowChat(false)} className="p-1.5 text-white/60 hover:text-white rounded-lg">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {(chatHistory[currentQuestion.id] ?? []).map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user" ? "bg-violet-600 text-white" : "bg-white/10 text-white/85"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t" style={{ borderColor: "rgba(124,58,237,0.25)" }}>
              <div className="flex gap-2 items-end">
                <textarea
                  rows={2}
                  placeholder="Ask for a hint…"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  disabled={chatLoading}
                  className="flex-1 px-3 py-2 text-xs text-white rounded-xl resize-none focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(124,58,237,0.3)" }}
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-white transition-all"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}