import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";

type IncomingResult = {
  title: string;
  status: "PASSED" | "FAILED" | "SKIPPED" | "UNTESTED" | string;
  comment?: string;
};
type ReportBody = {
  runName: string;
  results: IncomingResult[];
};

// POST /api/v1/test-runs/report
// Body: { runName: "CI_Build_42", results: [{ title: "Auth Test", status: "PASSED" }, ...] }
export async function POST(req: NextRequest) {
  let body: ReportBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.runName || !Array.isArray(body.results)) {
    return NextResponse.json({ error: "runName and results[] are required" }, { status: 400 });
  }

  // 1. Найти или создать TestRun с таким именем
  let testRun = await prisma.testRun.findFirst({ where: { name: body.runName } });
  if (!testRun) {
    testRun = await prisma.testRun.create({
      data: { name: body.runName, projectId: DEFAULT_PROJECT_ID },
    });
  }

  const created: string[] = [];
  const notFound: string[] = [];

  // 2. Для каждого результата найти тест-кейс по title и создать RunResult
  for (const item of body.results) {
    const testCase = await prisma.testCase.findFirst({ where: { title: item.title } });
    if (!testCase) {
      notFound.push(item.title);
      continue;
    }
    await prisma.runResult.create({
      data: {
        runId: testRun.id,
        caseId: testCase.id,
        status: item.status,
        comment: item.comment ?? null,
      },
    });
    created.push(item.title);
  }

  return NextResponse.json({
    runId: testRun.id,
    runName: testRun.name,
    created,
    notFound, // тест-кейсы с такими title не найдены в базе — результат не сохранён
  });
}
