import type { RoadmapNodeInfo } from "./cyber-security";
import { cyberSecurityNodes } from "./cyber-security";
import { frontendNodes } from "./frontend";
import { backendNodes } from "./backend";
import { artificialIntelligenceNodes } from "./artificial-intelligence";
import { dataScienceNodes } from "./data-science";
import { cloudComputingNodes } from "./cloud-computing";
import { devopsNodes } from "./devops";
import { uiUxNodes } from "./ui-ux";

export type { RoadmapNodeInfo };

/** Roadmap id → ordered topic nodes (the single source for courses + roadmaps). */
export const NODE_DATA: Record<string, RoadmapNodeInfo[]> = {
  "cyber-security": cyberSecurityNodes,
  frontend: frontendNodes,
  backend: backendNodes,
  "artificial-intelligence": artificialIntelligenceNodes,
  "data-science": dataScienceNodes,
  "cloud-computing": cloudComputingNodes,
  devops: devopsNodes,
  "ui-ux": uiUxNodes,
};
