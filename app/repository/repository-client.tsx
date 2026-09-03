"use client";

import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderPlus, Plus, Trash2, Sparkles, Loader2, X } from "lucide-react";
import {
  createSuite,
  createTestCase,
  deleteSuite,
  deleteTestCase,
  updateTestCase,
} from "@/lib/actions";
import { PRIORITIES, PRIORITY_LABEL, AUTOMATION, AUTOMATION_LABEL } from "@/lib/constants";

type TestCase = {
  id: string;
  title: string;
  description: string | null;
  steps: string[];
  expected: string | null;
  priority: string;
  automation: string;
  suiteId: string;
};
type Suite = { id: string; name: string; cases: TestCase[] };

export default function RepositoryClient({ initialSuites }: { initialSuites: Suite[] }) {
  const [suites, setSuites] = useState<Suite[]>(initialSuites);
  const [activeSuiteId, setActiveSuiteId] = useState<string | null>(initialSuites[0]?.id ?? null);
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeSuite = useMemo(() => suites.find((s) => s.id === activeSuiteId) ?? null, [suites, activeSuiteId]);

  async function handleAddSuite() {
    const name = prompt("Название раздела:");
    if (!name) return;
    const suite = await createSuite(name);
    setSuites((prev) => [...prev, { ...suite, cases: [] }]);
    setActiveSuiteId(suite.id);
  }

  async function handleDeleteSuite(suiteId: string) {
    if (!confirm("Удалить раздел вместе со всеми тест-кейсами?")) return;
    await deleteSuite(suiteId);
    setSuites((prev) => prev.filter((s) => s.id !== suiteId));
    if (activeSuiteId === suiteId) setActiveSuiteId(null);
  }

  async function handleAddCase() {
    if (!activeSuiteId) return;
    const title = prompt("Название тест-кейса:");
    if (!title) return;
    const tc = await createTestCase(activeSuiteId, title);
    setSuites((prev) =>
      prev.map((s) => (s.id === activeSuiteId ? { ...s, cases: [tc as TestCase, ...s.cases] } : s))
    );
  }

  function openCase(tc: TestCase) {
    setSelectedCase(tc);
    setSheetOpen(true);
  }

  async function handleDeleteCase(caseId: string) {
    if (!confirm("Удалить тест-кейс?")) return;
    await deleteTestCase(caseId);
    setSuites((prev) => prev.map((s) => ({ ...s, cases: s.cases.filter((c) => c.id !== caseId) })));
    setSheetOpen(false);
  }

  function patchLocalCase(updated: TestCase) {
    setSuites((prev) =>
      prev.map((s) => ({
        ...s,
        cases: s.cases.map((c) => (c.id === updated.id ? updated : c)),
      }))
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border flex flex-col">
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Разделы</span>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleAddSuite}>
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {suites.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSuiteId(s.id)}
                className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer ${
                  activeSuiteId === s.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <span className="truncate">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{s.cases.length}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSuite(s.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {suites.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-4">Разделов пока нет. Добавьте первый.</p>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main table */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="h-14 flex items-center justify-between px-6 border-b border-border">
          <h1 className="text-sm font-medium text-foreground">
            {activeSuite ? activeSuite.name : "Выберите раздел"}
          </h1>
          <Button size="sm" disabled={!activeSuiteId} onClick={handleAddCase}>
            <Plus className="h-4 w-4 mr-1.5" /> Тест-кейс
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {activeSuite && activeSuite.cases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Название</TableHead>
                  <TableHead className="text-muted-foreground w-28">Тип</TableHead>
                  <TableHead className="text-muted-foreground w-32">Приоритет</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSuite.cases.map((c) => (
                  <TableRow
                    key={c.id}
                    onClick={() => openCase(c)}
                    className="border-border cursor-pointer hover:bg-accent"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {c.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-foreground">{c.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground border-border">
                        {AUTOMATION_LABEL[c.automation]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {PRIORITY_LABEL[c.priority]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
              <p>{activeSuite ? "В этом разделе пока нет тест-кейсов" : "Выберите раздел слева"}</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-background border-border text-foreground w-[520px] sm:max-w-[520px] overflow-y-auto">
          {selectedCase && (
            <CaseEditor
              testCase={selectedCase}
              onSaved={(updated) => {
                patchLocalCase(updated);
                setSelectedCase(updated);
              }}
              onDelete={() => handleDeleteCase(selectedCase.id)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CaseEditor({
  testCase,
  onSaved,
  onDelete,
}: {
  testCase: TestCase;
  onSaved: (c: TestCase) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(testCase.title);
  const [description, setDescription] = useState(testCase.description ?? "");
  const [steps, setSteps] = useState<string[]>(testCase.steps.length ? testCase.steps : [""]);
  const [expected, setExpected] = useState(testCase.expected ?? "");
  const [priority, setPriority] = useState(testCase.priority);
  const [automation, setAutomation] = useState(testCase.automation);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateTestCase(testCase.id, {
        title,
        description,
        steps,
        expected,
        priority,
        automation,
      });
      onSaved(updated as unknown as TestCase);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    if (!description.trim()) {
      alert("Сначала опишите фичу в поле «Описание фичи»");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error("Ошибка генерации");
      const data = await res.json();
      setSteps(data.steps?.length ? data.steps : [""]);
      setExpected(data.expected ?? "");
    } catch (e) {
      alert("Не удалось сгенерировать шаги. Проверьте API-ключ на сервере.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <SheetHeader>
        <SheetTitle className="text-foreground">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-none text-lg font-semibold px-0 focus-visible:ring-0"
          />
        </SheetTitle>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Приоритет</Label>
          <Select value={priority} onValueChange={(val) => val && setPriority(val)}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Тип</Label>
          <Select value={automation} onValueChange={(val) => val && setAutomation(val)}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {AUTOMATION.map((a) => (
                <SelectItem key={a} value={a}>
                  {AUTOMATION_LABEL[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs">Описание фичи</Label>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleGenerate}
            disabled={generating}
            className="h-7 text-xs gap-1.5"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Сгенерировать шаги с помощью AI
          </Button>
        </div>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите фичу своими словами — AI предложит шаги теста"
          className="bg-card border-border min-h-[70px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Шаги</Label>
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xs font-mono text-muted-foreground pt-2 w-5">{i + 1}.</span>
            <Textarea
              value={step}
              onChange={(e) => {
                const next = [...steps];
                next[i] = e.target.value;
                setSteps(next);
              }}
              className="bg-card border-border min-h-[40px]"
            />
            <button
              className="text-muted-foreground hover:text-destructive pt-2"
              onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="border-border" onClick={() => setSteps([...steps, ""])}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Добавить шаг
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Ожидаемый результат</Label>
        <Textarea
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          className="bg-card border-border min-h-[60px]"
        />
      </div>

      <div className="flex gap-2 pt-2 border-t border-border mt-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Сохранить
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}