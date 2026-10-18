"use client";

import type { RoadmapNodeInfo } from "@/data/roadmap-nodes/cyber-security";
import type { CoursePathLink } from "@/lib/career-paths";
import RoadmapClient from "./RoadmapClient";

export default function RoadmapWrapper({
  nodeData,
  roadmapId,
  paths,
}: {
  nodeData: RoadmapNodeInfo[];
  roadmapId: string;
  paths: CoursePathLink[];
}) {
  return <RoadmapClient nodeData={nodeData} roadmapId={roadmapId} paths={paths} />;
}
