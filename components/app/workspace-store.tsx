"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLiveQuery } from "@neon/realtime-react";
import type { SealedLiveQuery } from "@neon/realtime/client";
import {
  createResume as createResumeAction,
  deleteResume as deleteResumeAction,
  duplicateResume as duplicateResumeAction,
  saveResume as saveResumeAction,
} from "@/app/actions/resumes";
import { setPlan as setPlanAction, updateProfileName } from "@/app/actions/profile";
import { useToast } from "@/components/ui/toast";
import type { LiveResumeRow } from "@/lib/realtime/map";
import { liveRowToRecord } from "@/lib/realtime/map";
import type {
  CreateResumeInput,
  ResumeRecord,
  WorkspacePlan,
  WorkspaceProfile,
} from "@/lib/resume/types";

type SaveState = "saved" | "saving";

type PendingSave = {
  timer: number | null;
  inFlight: boolean;
  dirty: boolean;
};

type WorkspaceContextValue = {
  profile: WorkspaceProfile;
  resumes: ResumeRecord[];
  hydrated: boolean;
  liveStatus: "connecting" | "live" | "stale" | "closed" | "error" | "polling";
  getResume: (id: string) => ResumeRecord | undefined;
  saveStateFor: (id: string) => SaveState;
  createResume: (input: CreateResumeInput) => Promise<ResumeRecord>;
  duplicateResume: (id: string) => Promise<ResumeRecord | null>;
  deleteResume: (id: string) => Promise<void>;
  updateResume: (
    id: string,
    updater: (resume: ResumeRecord) => ResumeRecord,
    options?: { touch?: boolean },
  ) => void;
  renameResume: (id: string, title: string) => Promise<void>;
  mergeResume: (resume: ResumeRecord) => void;
  updateProfile: (patch: { name: string }) => Promise<void>;
  changePlan: (plan: WorkspacePlan) => Promise<void>;
  applyUsage: (remaining: number) => void;
  applyConsent: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 700;

function recordToLiveRow(record: ResumeRecord): LiveResumeRow {
  return {
    id: record.id,
    title: record.title,
    target_role: record.targetRole,
    template: record.template,
    accent: record.accent,
    density: record.density,
    last_tailored_for: record.lastTailoredFor ?? null,
    content: record.content,
    version: record.version,
    created_at_ms: new Date(record.createdAt).getTime(),
    updated_at_ms: new Date(record.updatedAt).getTime(),
  };
}

function isBusy(pending: PendingSave | undefined): boolean {
  return Boolean(pending && (pending.inFlight || pending.dirty || pending.timer));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function WorkspaceProvider({
  initialProfile,
  initialResumes,
  sealedQuery,
  children,
}: {
  initialProfile: WorkspaceProfile;
  initialResumes: ResumeRecord[];
  sealedQuery: SealedLiveQuery<LiveResumeRow>;
  children: ReactNode;
}) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<WorkspaceProfile>(initialProfile);
  const [resumes, setResumes] = useState<ResumeRecord[]>(initialResumes);
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [hydrated] = useState(true);
  const [polling, setPolling] = useState(false);

  const resumesRef = useRef(resumes);
  const revisionRef = useRef(new Map<string, number>());
  const pendingRef = useRef(new Map<string, PendingSave>());
  const toastRef = useRef(toast);
  const utilsRef = useRef<{
    awaitTxId: (txid: string, timeout?: number) => Promise<void>;
  } | null>(null);

  useEffect(() => {
    resumesRef.current = resumes;
  }, [resumes]);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const [query] = useState(sealedQuery);
  const initialLiveData = useMemo(
    () => initialResumes.map(recordToLiveRow),
    [initialResumes],
  );

  const refresh = useCallback(async () => {
    const response = await fetch("/api/realtime/resumes", { method: "POST" });
    if (!response.ok) {
      throw new Error(`Could not renew the live query (${response.status})`);
    }
    return (await response.json()) as SealedLiveQuery<LiveResumeRow>;
  }, []);

  const { data, status, utils } = useLiveQuery(query, {
    initialData: initialLiveData,
    refreshQuery: refresh,
  });

  useEffect(() => {
    utilsRef.current = utils;
  }, [utils]);

  // Apply authoritative rows, but keep a row that still has unsaved local
  // edits. Local-only rows are kept only while their create/save is pending.
  const applyAuthoritative = useCallback((liveRows: ResumeRecord[]) => {
    setResumes((current) => {
      const liveIds = new Set(liveRows.map((row) => row.id));
      const localById = new Map(current.map((row) => [row.id, row]));

      const merged = liveRows.map((live) => {
        const local = localById.get(live.id);
        if (local && isBusy(pendingRef.current.get(live.id))) {
          return {
            ...local,
            version: Math.max(local.version, live.version),
          };
        }
        return live;
      });

      for (const local of current) {
        if (!liveIds.has(local.id) && isBusy(pendingRef.current.get(local.id))) {
          merged.unshift(local);
        }
      }

      return merged;
    });
  }, []);

  useEffect(() => {
    if (!data) return;
    applyAuthoritative(data.map(liveRowToRecord));
  }, [data, applyAuthoritative]);

  // The Realtime socket is the primary transport. Some networks and proxies
  // reject the WebSocket handshake; in that case keep the workspace coherent
  // with a slow authenticated poll instead of leaving other tabs stale.
  useEffect(() => {
    if (status === "live") return;

    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      try {
        const response = await fetch("/api/workspace/resumes", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          resumes?: ResumeRecord[];
        };
        if (cancelled || !Array.isArray(payload.resumes)) return;
        applyAuthoritative(payload.resumes);
        setPolling(true);
      } catch {
        // The next tick retries.
      }
    }

    void poll();
    const interval = window.setInterval(poll, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [status, applyAuthoritative]);

  const liveStatus = polling && status !== "live" ? "polling" : status;

  const setSaveState = useCallback((id: string, state: SaveState) => {
    setSaveStates((current) =>
      current[id] === state ? current : { ...current, [id]: state },
    );
  }, []);

  const flush = useCallback(
    async (id: string) => {
      const pending = pendingRef.current.get(id);
      if (!pending || pending.inFlight || !pending.dirty) return;

      const resume = resumesRef.current.find((row) => row.id === id);
      if (!resume) {
        pendingRef.current.delete(id);
        return;
      }

      const revision = revisionRef.current.get(id) ?? 0;
      pending.dirty = false;
      pending.inFlight = true;

      try {
        const result = await saveResumeAction({
          id: resume.id,
          title: resume.title,
          targetRole: resume.targetRole,
          template: resume.template,
          accent: resume.accent,
          density: resume.density,
          content: resume.content,
          version: resume.version,
          lastTailoredFor: resume.lastTailoredFor ?? null,
        });

        const currentRevision = revisionRef.current.get(id) ?? 0;
        setResumes((current) =>
          current.map((row) => {
            if (row.id !== id) return row;
            if (currentRevision === revision) return result.resume;
            return {
              ...row,
              version: result.resume.version,
              updatedAt: result.resume.updatedAt,
            };
          }),
        );

        try {
          await utilsRef.current?.awaitTxId(result.txid, 10_000);
        } catch {
          // The row is already saved; Realtime will reconcile on the next event.
        }
      } catch (error) {
        toastRef.current(
          errorMessage(error) ||
            "Could not save this resume. Check your connection and try again.",
          "error",
        );
      } finally {
        pending.inFlight = false;
        if (pending.dirty) {
          pending.timer = window.setTimeout(() => {
            pending.timer = null;
            void flush(id);
          }, SAVE_DEBOUNCE_MS);
        } else {
          pendingRef.current.delete(id);
          setSaveState(id, "saved");
        }
      }
    },
    [setSaveState],
  );

  const scheduleSave = useCallback(
    (id: string) => {
      const pending = pendingRef.current.get(id) ?? {
        timer: null,
        inFlight: false,
        dirty: false,
      };
      pending.dirty = true;
      pendingRef.current.set(id, pending);
      setSaveState(id, "saving");

      if (pending.timer !== null) window.clearTimeout(pending.timer);
      pending.timer = window.setTimeout(() => {
        pending.timer = null;
        void flush(id);
      }, SAVE_DEBOUNCE_MS);
    },
    [flush, setSaveState],
  );

  const updateResume = useCallback<WorkspaceContextValue["updateResume"]>(
    (id, updater, options) => {
      setResumes((current) =>
        current.map((row) => {
          if (row.id !== id) return row;
          const next = updater(row);
          if (next === row) return row;
          return options?.touch === false
            ? next
            : { ...next, updatedAt: new Date().toISOString() };
        }),
      );
      revisionRef.current.set(id, (revisionRef.current.get(id) ?? 0) + 1);
      scheduleSave(id);
    },
    [scheduleSave],
  );

  const getResume = useCallback(
    (id: string) => resumes.find((row) => row.id === id),
    [resumes],
  );

  const createResume = useCallback<WorkspaceContextValue["createResume"]>(
    async (input) => {
      try {
        const result = await createResumeAction(input);
        setResumes((current) => [result.resume, ...current]);
        pendingRef.current.delete(result.resume.id);
        return result.resume;
      } catch (error) {
        toastRef.current(errorMessage(error), "error");
        throw error;
      }
    },
    [],
  );

  const duplicateResume = useCallback<WorkspaceContextValue["duplicateResume"]>(
    async (id) => {
      try {
        const result = await duplicateResumeAction({ id });
        setResumes((current) => [result.resume, ...current]);
        pendingRef.current.delete(result.resume.id);
        return result.resume;
      } catch (error) {
        toastRef.current(errorMessage(error), "error");
        return null;
      }
    },
    [],
  );

  const deleteResume = useCallback<WorkspaceContextValue["deleteResume"]>(
    async (id) => {
      const snapshot = resumesRef.current;
      setResumes((current) => current.filter((row) => row.id !== id));
      pendingRef.current.delete(id);
      try {
        await deleteResumeAction({ id });
      } catch (error) {
        setResumes(snapshot);
        toastRef.current(errorMessage(error), "error");
      }
    },
    [],
  );

  const renameResume = useCallback<WorkspaceContextValue["renameResume"]>(
    async (id, title) => {
      updateResume(id, (row) => ({ ...row, title }));
    },
    [updateResume],
  );

  const mergeResume = useCallback<WorkspaceContextValue["mergeResume"]>(
    (resume) => {
      pendingRef.current.delete(resume.id);
      setResumes((current) =>
        current.some((row) => row.id === resume.id)
          ? current.map((row) => (row.id === resume.id ? resume : row))
          : [resume, ...current],
      );
      setSaveState(resume.id, "saved");
    },
    [setSaveState],
  );

  const updateProfile = useCallback<WorkspaceContextValue["updateProfile"]>(
    async (patch) => {
      try {
        const result = await updateProfileName({ name: patch.name });
        setProfile((current) => ({
          ...current,
          name: result.name,
          firstName: result.firstName,
          initials: result.initials,
        }));
      } catch (error) {
        toastRef.current(errorMessage(error), "error");
      }
    },
    [],
  );

  const changePlan = useCallback<WorkspaceContextValue["changePlan"]>(
    async (plan) => {
      try {
        const result = await setPlanAction({ plan });
        setProfile((current) => ({
          ...current,
          plan: result.plan,
          aiUsed: result.aiUsed,
          aiIncluded: result.aiIncluded,
          renewsOn: result.renewsOn,
        }));
      } catch (error) {
        toastRef.current(errorMessage(error), "error");
      }
    },
    [],
  );

  const applyUsage = useCallback((remaining: number) => {
    setProfile((current) => ({
      ...current,
      aiUsed: Math.max(0, current.aiIncluded - remaining),
    }));
  }, []);

  const applyConsent = useCallback(() => {
    setProfile((current) => ({ ...current, hasAiConsent: true }));
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      profile,
      resumes,
      hydrated,
      liveStatus,
      getResume,
      saveStateFor: (id) => saveStates[id] ?? "saved",
      createResume,
      duplicateResume,
      deleteResume,
      updateResume,
      renameResume,
      mergeResume,
      updateProfile,
      changePlan,
      applyUsage,
      applyConsent,
    }),
    [
      profile,
      resumes,
      hydrated,
      liveStatus,
      getResume,
      saveStates,
      createResume,
      duplicateResume,
      deleteResume,
      updateResume,
      renameResume,
      mergeResume,
      updateProfile,
      changePlan,
      applyUsage,
      applyConsent,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}
