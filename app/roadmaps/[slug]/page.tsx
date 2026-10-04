import { notFound } from "next/navigation";
import { roadmaps } from "@/data/roadmaps";
import { NODE_DATA, type RoadmapNodeInfo } from "@/data/roadmap-nodes";
import RoadmapWrapper from "./RoadmapWrapper";


export const dynamicParams = false;

export function generateStaticParams() {
  return roadmaps.map((r) => ({ slug: r.id }));
}

export default async function RoadmapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roadmap = roadmaps.find((r) => r.id === slug);
  if (!roadmap) notFound();

  const nodeData = NODE_DATA[slug] ?? [];

  if (nodeData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen text-fg-subtle">
        <div className="text-center">
          <div className="text-5xl mb-4">{roadmap.icon}</div>
          <p className="text-lg font-semibold text-fg mb-2">{roadmap.title} roadmap coming soon</p>
          <p className="text-sm">We&apos;re building this one. Check back soon!</p>
        </div>
      </div>
    );
  }

  return <RoadmapWrapper nodeData={nodeData} roadmapId={slug} />;
}
