import { AnalysisClient } from "./analysis-client";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnalysisClient projectId={id} />;
}
