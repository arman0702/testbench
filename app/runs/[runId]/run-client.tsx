"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, XCircle, MinusCircle, Circle } from "lucide-react";
import { updateRunResult } from "@/lib/runActions";
import { RESULT_COLOR, RESULT_LABEL } from "@/lib/constants";

type TestCase = { id: string; title: string; steps: string[]; expected: string | null };
type RunResult = {
  id: string;
  status: string;
  comment: string | null;
  testCase: TestCase;
};
type TestRun = { id: string; name: string; results: RunResult[] };

export default function RunClient({ run }: { run: TestRun }) {
  const [results, setResults] = useState<RunResult[]>(run.results);
  const [activeId, setActiveId] = useState<string | null>(run.results[0]?.id ?? null);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [saving, setSaving] = useState(false);

  const active = useMemo(() => results.find((r) => r.id === activeId) ?? null, [results, activeId]);

  const total = results.length;
  const passed = results.filter((r) => r.status === "PASSED").length;
  const executed = results.filter((r) => r.status !== "UNTESTED").length;
  const progressPct = total ? Math.round((passed / total) * 100) : 0;

  function selectResult(r: RunResult) {
    setActiveId(r.id);
    setCheckedSteps({});
    setComment(r.comment ?? "");
    setShowCommentBox(r.status === "FAILED");
  }

  async function submitStatus(status: "PASSED" | "FAILED" | "SKIPPED") {
    if (!active) return;
    if (status === "FAILED" && !showCommentBox) {
      // первый клик на FAIL — просто открываем поле комментария, не сохраняем сразу
      setShowCommentBox(true);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateRunResult(active.id, status, status === "FAILED" ? comment : undefined);
      setResults((prev) => prev.map((r) => (r.id === active.id ? { ...r, ...updated } : r)));
      setShowCommentBox(false);
      // авто-переход к следующему невыполненному тесту
      const idx = results.findIndex((r) => r.id === active.id);
      const next = results.slice(idx + 1).find((r) => r.status === "UNTESTED");
      if (next) selectResult(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      {/* Top progress bar */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-sm font-medium text-zinc-300">{run.name}</h1>
          <span className="text-xs text-zinc-500">
            {passed} / {total} пройдено &middot; {executed} / {total} выполнено &middot; {progressPct}%
          </span>
        </div>
        <Progress value={progressPct} className="h-2 bg-zinc-800" />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: list of results */}
        <aside className="w-80 shrink-0 border-r border-zinc-800 overflow-y-auto">
          {results.map((r) => (
            <div
              key={r.id}
              onClick={() => selectResult(r)}
              className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-900 cursor-pointer ${
                activeId === r.id ? "bg-zinc-900" : "hover:bg-zinc-900/50"
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${RESULT_COLOR[r.status]}`} />
              <div className="min-w-0">
                <p className="text-sm text-zinc-200 truncate">{r.testCase.title}</p>
                <p className="text-xs text-zinc-500">{RESULT_LABEL[r.status]}</p>
              </div>
            </div>
          ))}
        </aside>

        {/* Center: step-by-step execution */}
        <main className="flex-1 flex flex-col min-w-0">
          {active ? (
            <>
              <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
                <h2 className="text-lg font-semibold mb-1">{active.testCase.title}</h2>
                <p className="text-xs text-zinc-500 mb-6">Отмечайте шаги по мере выполнения</p>

                <div className="space-y-3">
                  {active.testCase.steps.length === 0 && (
                    <p className="text-sm text-zinc-600">Для этого теста не заданы шаги.</p>
                  )}
                  {active.testCase.steps.map((step, i) => (
                    <label key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Checkbox
                        checked={!!checkedSteps[i]}
                        onCheckedChange={(v) => setCheckedSteps((prev) => ({ ...prev, [i]: !!v }))}
                        className="mt-0.5"
                      />
                      <span className={checkedSteps[i] ? "line-through text-zinc-500" : ""}>{step}</span>
                    </label>
                  ))}
                </div>

                {active.testCase.expected && (
                  <div className="mt-6 rounded-md border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Ожидаемый результат</p>
                    <p className="text-sm text-zinc-300">{active.testCase.expected}</p>
                  </div>
                )}

                {showCommentBox && (
                  <div className="mt-6">
                    <p className="text-xs text-zinc-500 mb-1.5">Комментарий / описание ошибки</p>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Что пошло не так?"
                      className="bg-zinc-900 border-zinc-800"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Bottom big buttons */}
              <div className="border-t border-zinc-800 p-5 flex gap-3">
                <Button
                  size="lg"
                  disabled={saving}
                  onClick={() => submitStatus("PASSED")}
                  className="flex-1 h-14 text-base bg-emerald-600 hover:bg-emerald-500"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" /> PASS
                </Button>
                <Button
                  size="lg"
                  disabled={saving}
                  onClick={() => submitStatus("FAILED")}
                  className="flex-1 h-14 text-base bg-red-600 hover:bg-red-500"
                >
                  <XCircle className="h-5 w-5 mr-2" /> FAIL
                </Button>
                <Button
                  size="lg"
                  disabled={saving}
                  onClick={() => submitStatus("SKIPPED")}
                  variant="secondary"
                  className="flex-1 h-14 text-base"
                >
                  <MinusCircle className="h-5 w-5 mr-2" /> SKIP
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm gap-2">
              <Circle className="h-4 w-4" /> Выберите тест слева
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
