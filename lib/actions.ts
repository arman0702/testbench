"use server";

import { prisma } from "@/lib/prisma";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function getSuitesWithCases() {
  return prisma.suite.findMany({
    where: { projectId: DEFAULT_PROJECT_ID },
    include: { cases: { orderBy: { updatedAt: "desc" } } },
    orderBy: { name: "asc" },
  });
}

export async function createSuite(name: string) {
  if (!name.trim()) throw new Error("Название раздела не может быть пустым");
  const suite = await prisma.suite.create({
    data: { name: name.trim(), projectId: DEFAULT_PROJECT_ID },
  });
  revalidatePath("/repository");
  return suite;
}

export async function renameSuite(suiteId: string, name: string) {
  const suite = await prisma.suite.update({
    where: { id: suiteId },
    data: { name: name.trim() },
  });
  revalidatePath("/repository");
  return suite;
}

export async function deleteSuite(suiteId: string) {
  await prisma.testCase.deleteMany({ where: { suiteId } });
  await prisma.suite.delete({ where: { id: suiteId } });
  revalidatePath("/repository");
}

export async function createTestCase(suiteId: string, title: string) {
  if (!title.trim()) throw new Error("Название тест-кейса не может быть пустым");
  const testCase = await prisma.testCase.create({
    data: { suiteId, title: title.trim(), steps: [] },
  });
  revalidatePath("/repository");
  return testCase;
}

export type UpdateTestCaseInput = {
  title: string;
  description?: string;
  steps: string[];
  expected?: string;
  priority: string;
  automation: string;
};

export async function updateTestCase(caseId: string, data: UpdateTestCaseInput) {
  const updated = await prisma.testCase.update({
    where: { id: caseId },
    data: {
      title: data.title.trim(),
      description: data.description || null,
      steps: data.steps.filter((s) => s.trim().length > 0),
      expected: data.expected || null,
      priority: data.priority,
      automation: data.automation,
    },
  });
  revalidatePath("/repository");
  return updated;
}

export async function deleteTestCase(caseId: string) {
  await prisma.runResult.deleteMany({ where: { caseId } });
  await prisma.testCase.delete({ where: { id: caseId } });
  revalidatePath("/repository");
}
