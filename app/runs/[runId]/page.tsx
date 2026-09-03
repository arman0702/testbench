import { notFound } from "next/navigation";
import { getRunWithResults } from "@/lib/runActions";
import RunClient from "./run-client";

export default async function RunPage({ params }: { params: { runId: string } }) {
  const run = await getRunWithResults(params.runId);
  if (!run) notFound();
  return <RunClient run={run} />;
}
