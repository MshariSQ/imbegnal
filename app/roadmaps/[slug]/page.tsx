import { notFound } from "next/navigation";
import { roadmaps } from "@/data/roadmaps";
import { cyberSecurityNodes } from "@/data/roadmap-nodes/cyber-security";
import { frontendNodes } from "@/data/roadmap-nodes/frontend";
import { backendNodes } from "@/data/roadmap-nodes/backend";
import { artificialIntelligenceNodes } from "@/data/roadmap-nodes/artificial-intelligence";
import { dataScienceNodes } from "@/data/roadmap-nodes/data-science";
import { cloudComputingNodes } from "@/data/roadmap-nodes/cloud-computing";
import { devopsNodes } from "@/data/roadmap-nodes/devops";
import { uiUxNodes } from "@/data/roadmap-nodes/ui-ux";
import type { RoadmapNodeInfo } from "@/data/roadmap-nodes/cyber-security";
import { ArrowLeft } from "lucide-react";
import RoadmapWrapper from "./RoadmapWrapper";

// Map of slug → node data
const NODE_DATA: Record<string, RoadmapNodeInfo[]> = {
  "cyber-security": cyberSecurityNodes,
  "frontend": frontendNodes,
  "backend": backendNodes,
  "artificial-intelligence": artificialIntelligenceNodes,
  "data-science": dataScienceNodes,
  "cloud-computing": cloudComputingNodes,
  "devops": devopsNodes,
  "ui-ux": uiUxNodes,
};


export const dynamicParams = false;

export function generateStaticParams() {
  return roadmaps.map((r) => ({ slug: r.id }));
}

export default async function RoadmapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roadmap = roadmaps.find((r) => r.id === slug);
  if (!roadmap) notFound();

  const nodeData = NODE_DATA[slug] ?? [];

  return (
    <div className="flex flex-col bg-[#0D1117] h-screen overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[#21262d] px-6 py-4 pt-20 flex items-center gap-4">
        <a
          href="/skillforge/roadmaps/"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} /> Roadmaps
        </a>
        <div className="w-px h-4 bg-[#21262d]" />
        <span className="text-xl">{roadmap.icon}</span>
        <h1 className="font-bold text-white">{roadmap.title}</h1>
      </div>

      {nodeData.length > 0 ? (
        <RoadmapWrapper nodeData={nodeData} roadmapId={slug} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-5xl mb-4">{roadmap.icon}</div>
            <p className="text-lg font-semibold text-white mb-2">{roadmap.title} roadmap coming soon</p>
            <p className="text-sm">We&apos;re building this one. Check back soon!</p>
          </div>
        </div>
      )}
    </div>
  );
}
