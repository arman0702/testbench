export const dynamic = "force-dynamic";
import { getSuitesWithCases } from "@/lib/actions";
import RepositoryClient from "./repository-client";

export default async function RepositoryPage() {
  const suites = await getSuitesWithCases();
  return <RepositoryClient initialSuites={suites} />;
}
