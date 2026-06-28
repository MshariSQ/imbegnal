import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { roadmaps } from "@/data/roadmaps";
import { cyberSecurityNodes } from "@/data/roadmap-nodes/cyber-security";
import type { Node, Edge } from "reactflow";
import type { RoadmapNodeInfo } from "@/data/roadmap-nodes/cyber-security";
import { ArrowLeft } from "lucide-react";

const RoadmapClient = dynamic(() => import("./RoadmapClient"), { ssr: false });

const STATUS_COLORS: Record<string, { border: string; bg: string }> = {
  required:  { border: "#10b981", bg: "#0D1117" },
  important: { border: "#3b82f6", bg: "#0D1117" },
  optional:  { border: "#8b5cf6", bg: "#0D1117" },
};

// Map of slug → node data
const NODE_DATA: Record<string, RoadmapNodeInfo[]> = {
  "cyber-security": cyberSecurityNodes,
};

// Build React Flow nodes/edges from node data
function buildFlow(data: RoadmapNodeInfo[]): { nodes: Node[]; edges: Edge[] } {
  const COLS = 3;
  const X_SPACING = 240;
  const Y_SPACING = 120;

  const nodes: Node[] = data.map((d, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const s = STATUS_COLORS[d.status];
    return {
      id: d.id,
      position: { x: col * X_SPACING, y: row * Y_SPACING },
      data: { label: d.label },
      style: {
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        borderRadius: 12,
        padding: "10px 16px",
        color: "#e6edf3",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: `0 0 12px ${s.border}22`,
      },
    };
  });

  const edges: Edge[] = data.slice(1).map((d, i) => ({
    id: `e${i}`,
    source: data[i].id,
    target: d.id,
    animated: true,
    style: { stroke: "#30363d", strokeWidth: 1.5 },
  }));

  return { nodes, edges };
}

export function generateStaticParams() {
  return roadmaps.map((r) => ({ slug: r.id }));
}

export default function RoadmapPage({ params }: { params: { slug: string } }) {
  const roadmap = roadmaps.find((r) => r.id === params.slug);
  if (!roadmap) notFound();

  const nodeData = NODE_DATA[params.slug] ?? [];
  const { nodes, edges } = buildFlow(nodeData);

  const legend = [
    { color: "#10b981", label: "Required" },
    { color: "#3b82f6", label: "Important" },
    { color: "#8b5cf6", label: "Optional" },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0D1117] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[#21262d] px-6 py-4 pt-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/skillforge/roadmaps/"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} /> Roadmaps
          </a>
          <div className="w-px h-4 bg-[#21262d]" />
          <div className="flex items-center gap-2">
            <span className="text-xl">{roadmap.icon}</span>
            <h1 className="font-bold text-white">{roadmap.title}</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
          <span className="text-xs text-gray-600 ml-2">Click any node for resources →</span>
        </div>
      </div>

      {/* React Flow */}
      {nodeData.length > 0 ? (
        <RoadmapClient initialNodes={nodes} initialEdges={edges} nodeData={nodeData} />
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
