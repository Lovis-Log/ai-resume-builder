import type { DemoTool } from "@/lib/demo/types";

export type StudioSection =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills";

export type AiPanelFocus =
  | {
      kind: "summary";
      nonce: number;
    }
  | {
      kind: "bullet";
      experienceId: string;
      bulletIndex: number;
      nonce: number;
    }
  | null;

export type SaveState = "saved" | "saving";

export type ToolDefinition = {
  id: DemoTool;
  label: string;
  description: string;
};

export const STUDIO_TOOLS: ToolDefinition[] = [
  { id: "write", label: "Write", description: "Edit resume content" },
  { id: "design", label: "Design", description: "Templates and page style" },
  { id: "ai", label: "Lume AI", description: "Simulated writing assistant" },
  { id: "tailor", label: "Tailor", description: "Match a job description" },
  { id: "score", label: "Score", description: "Review resume checks" },
];
