"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  toast: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "info") => {
    const id = crypto.randomUUID();
    setItems((current) => [...current, { id, message, kind }]);
    setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 5_000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-lg",
              item.kind === "success" && "border-green-200",
              item.kind === "error" && "border-red-200",
              item.kind === "info" && "border-stone-200",
            )}
          >
            {item.kind === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-green-600" />
            ) : item.kind === "error" ? (
              <XCircle className="mt-0.5 h-4 w-4 flex-none text-red-600" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 flex-none text-stone-500" />
            )}
            <span className="text-stone-700">{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
