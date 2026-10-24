"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createDemoState,
  createResumeRecord,
  duplicateResumeRecord,
  DEMO_STORAGE_KEY,
  type CreateResumeInput,
} from "@/lib/demo/seed";
import type { DemoProfile, DemoResume, DemoState } from "@/lib/demo/types";

type DemoStoreValue = {
  state: DemoState;
  profile: DemoProfile;
  resumes: DemoResume[];
  hydrated: boolean;
  getResume: (id: string) => DemoResume | undefined;
  createResume: (input: CreateResumeInput) => DemoResume;
  updateResume: (
    id: string,
    updater: (resume: DemoResume) => DemoResume,
    options?: { touch?: boolean },
  ) => void;
  deleteResume: (id: string) => void;
  duplicateResume: (id: string) => DemoResume | null;
  updateProfile: (patch: Partial<DemoProfile>) => void;
  consumeAI: (count?: number) => void;
  resetDemo: () => void;
};

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoState>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.resumes) &&
    Boolean(candidate.profile) &&
    typeof candidate.profile?.name === "string"
  );
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createDemoState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Deferred one frame so React can commit the deterministic seeded shell
    // before swapping in the locally saved workspace.
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (isDemoState(parsed)) {
            setState(parsed);
          }
        }
      } catch {
        // A malformed draft should never block the local workspace.
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be disabled; the in-memory workspace still works.
    }
  }, [state, hydrated]);

  const getResume = useCallback(
    (id: string) => state.resumes.find((resume) => resume.id === id),
    [state.resumes],
  );

  const createResume = useCallback((input: CreateResumeInput) => {
    const record = createResumeRecord(input);
    setState((current) => ({
      ...current,
      resumes: [record, ...current.resumes],
    }));
    return record;
  }, []);

  const updateResume = useCallback(
    (
      id: string,
      updater: (resume: DemoResume) => DemoResume,
      options?: { touch?: boolean },
    ) => {
      setState((current) => ({
        ...current,
        resumes: current.resumes.map((resume) => {
          if (resume.id !== id) return resume;
          const next = updater(resume);
          return options?.touch === false
            ? next
            : { ...next, updatedAt: new Date().toISOString() };
        }),
      }));
    },
    [],
  );

  const deleteResume = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      resumes: current.resumes.filter((resume) => resume.id !== id),
    }));
  }, []);

  const duplicateResume = useCallback((id: string) => {
    let created: DemoResume | null = null;
    setState((current) => {
      const source = current.resumes.find((resume) => resume.id === id);
      if (!source) return current;
      created = duplicateResumeRecord(source);
      return {
        ...current,
        resumes: [created, ...current.resumes],
      };
    });
    return created;
  }, []);

  const updateProfile = useCallback((patch: Partial<DemoProfile>) => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, ...patch },
    }));
  }, []);

  const consumeAI = useCallback((count = 1) => {
    setState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        aiUsed: Math.min(
          current.profile.aiIncluded,
          current.profile.aiUsed + count,
        ),
      },
    }));
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = createDemoState();
    setState(fresh);
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Ignore storage restrictions.
    }
  }, []);

  const value = useMemo<DemoStoreValue>(
    () => ({
      state,
      profile: state.profile,
      resumes: state.resumes,
      hydrated,
      getResume,
      createResume,
      updateResume,
      deleteResume,
      duplicateResume,
      updateProfile,
      consumeAI,
      resetDemo,
    }),
    [
      state,
      hydrated,
      getResume,
      createResume,
      updateResume,
      deleteResume,
      duplicateResume,
      updateProfile,
      consumeAI,
      resetDemo,
    ],
  );

  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore(): DemoStoreValue {
  const context = useContext(DemoStoreContext);
  if (!context) {
    throw new Error("useDemoStore must be used inside DemoStoreProvider");
  }
  return context;
}
