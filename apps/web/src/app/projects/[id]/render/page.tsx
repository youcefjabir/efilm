import { RenderClient } from "./render-client";

export default async function RenderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RenderClient projectId={id} />;
}
