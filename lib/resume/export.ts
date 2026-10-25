import { fileStem } from "./format";
import type { ResumeRecord, WorkspaceData } from "./types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadResumeJson(resume: ResumeRecord) {
  const payload = {
    app: "Lume Resume Studio",
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    resume,
  };
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    }),
    `${fileStem(resume.title)}.json`,
  );
}

export function downloadWorkspaceJson(state: WorkspaceData) {
  const payload = {
    app: "Lume Resume Studio",
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    ...state,
  };
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    }),
    "lume-workspace.json",
  );
}
