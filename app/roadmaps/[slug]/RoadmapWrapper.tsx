"use client";

import type { RoadmapNodeInfo } from "@/data/roadmap-nodes/cyber-security";
import RoadmapClient from "./RoadmapClient";

export default function RoadmapWrapper({
  nodeData,
  roadmapId,
}: {
  nodeData: RoadmapNodeInfo[];
  roadmapId: string;
}) {
  return <RoadmapClient nodeData={nodeData} roadmapId={roadmapId} />;
}
