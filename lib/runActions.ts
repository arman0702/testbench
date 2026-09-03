"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRunWithResults(runId: string) {
  return prisma.testRun.findUnique({
    where: { id: runId },
    include: {
      results: {
        include: { testCase: true },
        orderBy: { updatedAt: "asc" },
      },
    },
  });
}

export async function updateRunResult(resultId: string, status: string, comment?: string) {
  const updated = await prisma.runResult.update({
    where: { id: resultId },
    data: { status, comment: comment ?? null },
  });
  revalidatePath(`/runs/${updated.runId}`);
  return updated;
}
