"use client";

import { useState, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { X, Youtube, BookOpen, Award, FileText, ExternalLink } from "lucide-react";
import type { RoadmapNodeInfo } from "@/data/roadmap-nodes/cyber-security";

const TAG_COLORS: Record<string, string> = {
  Free: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
  Paid: "bg-amber-500/20 text-amber-400 border border-amber-500/20",
  Official: "bg-blue-500/20 text-blue-400 border border-blue-500/20",
  Recommended: "bg-purple-500/20 text-purple-400 border border-purple-500/20",
  "Free Audit": "bg-teal-500/20 text-teal-400 border border-teal-500/20",
  "Industry Standard": "bg-rose-500/20 text-rose-400 border border-rose-500/20",
};

const STATUS_COLORS: Record<string, { border: string; bg: string; label: string }> = {
  required:  { border: "#10b981", bg: "#10b98120", label: "Required" },
  important: { border: "#3b82f6", bg: "#3b82f620", label: "Important" },
  optional:  { border: "#8b5cf6", bg: "#8b5cf620", label: "Optional" },
};

function Tag({ label }: { label: string }) {
  const cls = TAG_COLORS[label] ?? "bg-white/10 text-gray-300 border border-white/10";
  return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function ResourceRow({
  icon,
  title,
  label,
  resource,
}: {
  icon: React.ReactNode;
  title: string;
  label: string;
  resource: { title: string; url: string; provider?: string; tags: string[]; duration?: string } | undefined;
}) {
  if (!resource) return null;
  return (
    <div className="bg-[#0D1117] rounded-xl p-4 border border-[#21262d]">
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        {icon}
        <span className="uppercase tracking-wider">{title}</span>
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start justify-between gap-2 group"
      >
        <div>
          <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
            {resource.title}
          </div>
          {resource.provider && <div className="text-xs text-gray-500 mt-0.5">{resource.provider}</div>}
          <div className="flex flex-wrap gap-1 mt-2">
            {resource.tags.map((t) => <Tag key={t} label={t} />)}
            {resource.duration && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">⏱ {resource.duration}</span>
            )}
          </div>
        </div>
        <ExternalLink size={14} className="text-gray-600 group-hover:text-emerald-400 mt-1 shrink-0 transition-colors" />
      </a>
    </div>
  );
}

function NodePanel({ node, onClose }: { node: RoadmapNodeInfo; onClose: () => void }) {
  const s = STATUS_COLORS[node.status];
  return (
    <div className="absolute right-0 top-0 bottom-0 w-96 bg-[#161B22] border-l border-[#21262d] z-10 overflow-y-auto">
      <div className="sticky top-0 bg-[#161B22] border-b border-[#21262d] px-5 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full border"
              style={{ color: s.border, backgroundColor: s.bg, borderColor: s.border }}
            >
              {s.label}
            </span>
          </div>
          <h3 className="font-bold text-white text-lg">{node.label}</h3>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <p className="text-sm text-gray-400 leading-relaxed">{node.description}</p>

        <ResourceRow icon={<Youtube size={13} />} title="YouTube" label="youtube" resource={node.resources.youtube} />
        <ResourceRow icon={<BookOpen size={13} />} title="Course" label="course" resource={node.resources.course} />
        <ResourceRow icon={<Award size={13} />} title="Certification" label="certification" resource={node.resources.certification} />
        <ResourceRow icon={<FileText size={13} />} title="Book" label="book" resource={node.resources.book} />
        <ResourceRow icon={<ExternalLink size={13} />} title="Official Docs" label="docs" resource={node.resources.docs} />
      </div>
    </div>
  );
}

export default function RoadmapClient({
  initialNodes,
  initialEdges,
  nodeData,
}: {
  initialNodes: Node[];
  initialEdges: Edge[];
  nodeData: RoadmapNodeInfo[];
}) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState<RoadmapNodeInfo | null>(null);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const info = nodeData.find((n) => n.id === node.id);
      setSelected(info ?? null);
    },
    [nodeData]
  );

  return (
    <div className="relative flex-1 min-h-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#21262d" gap={24} size={1} />
        <Controls className="!bg-[#161B22] !border-[#21262d] !shadow-none" />
        <MiniMap
          nodeColor={(n) => {
            const info = nodeData.find((d) => d.id === n.id);
            return STATUS_COLORS[info?.status ?? "optional"].border;
          }}
          className="!bg-[#161B22] !border-[#21262d]"
        />
      </ReactFlow>

      {selected && <NodePanel node={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
