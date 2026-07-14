import { StoryboardClient } from "./storyboard-client";

export default async function StoryboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoryboardClient projectId={id} />;
}
