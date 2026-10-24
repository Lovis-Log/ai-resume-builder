import { fileStem } from "./format";
import type { DemoResume, DemoState } from "./types";

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

export function downloadResumeJson(resume: DemoResume) {
  const payload = {
    app: "Lume Resume Studio",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    note: "Local demo export. Unsaved changes in this browser are included.",
    resume,
  };
  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    }),
    `${fileStem(resume.title)}.json`,
  );
}

export function downloadWorkspaceJson(state: DemoState) {
  const payload = {
    app: "Lume Resume Studio",
    schemaVersion: 1,
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
