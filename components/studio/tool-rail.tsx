"use client";

import Link from "next/link";
import {
  CircleHelp,
  FileText,
  Palette,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type { WorkspaceTool } from "@/lib/resume/types";
import { cn } from "@/lib/utils";
import { STUDIO_TOOLS } from "./studio-types";

const icons = {
  write: FileText,
  design: Palette,
  ai: Sparkles,
  tailor: Target,
  score: ShieldCheck,
} satisfies Record<WorkspaceTool, typeof FileText>;

export function ToolRail({
  activeTool,
  onSelectTool,
  onOpenHelp,
}: {
  activeTool: WorkspaceTool;
  onSelectTool: (tool: WorkspaceTool) => void;
  onOpenHelp: () => void;
}) {
  return (
    <nav className="tool-rail" aria-label="Resume tools">
      <div className="tool-rail-main">
        {STUDIO_TOOLS.map((tool) => {
          const Icon = icons[tool.id];
          const active = tool.id === activeTool;
          return (
            <button
              type="button"
              key={tool.id}
              className={cn("rail-button", active && "is-active")}
              onClick={() => onSelectTool(tool.id)}
              aria-label={tool.description}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={19} aria-hidden="true" />
              <span className="rail-label">{tool.label}</span>
              <span className="rail-tooltip" aria-hidden="true">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="tool-rail-foot">
        <button
          type="button"
          className="rail-button rail-button--quiet"
          onClick={onOpenHelp}
          aria-label="Help and shortcuts"
        >
          <CircleHelp size={18} aria-hidden="true" />
          <span className="rail-tooltip" aria-hidden="true">
            Help
          </span>
        </button>
        <Link
          href="/settings"
          className="rail-button rail-button--quiet"
          aria-label="Workspace settings"
        >
          <Settings size={18} aria-hidden="true" />
          <span className="rail-tooltip" aria-hidden="true">
            Settings
          </span>
        </Link>
      </div>
    </nav>
  );
}
