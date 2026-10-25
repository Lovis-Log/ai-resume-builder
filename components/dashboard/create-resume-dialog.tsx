"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { AppModal } from "@/components/app/app-modal";
import { TemplateMini } from "@/components/app/atoms";
import { useWorkspace } from "@/components/app/workspace-store";
import { useToast } from "@/components/ui/toast";
import type { CreateResumeInput } from "@/lib/resume/types";
import { TEMPLATES, type TemplateId } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

export function CreateResumeDialog({
  open,
  onClose,
  initialTemplate = "modern",
}: {
  open: boolean;
  onClose: () => void;
  initialTemplate?: TemplateId;
}) {
  const router = useRouter();
  const { createResume } = useWorkspace();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);
  const [withSample, setWithSample] = useState(false);
  const [pending, setPending] = useState(false);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      toast("Give this resume a name to keep it findable.", "error");
      return;
    }

    const input: CreateResumeInput = {
      title: title.trim(),
      template,
      startWithExample: withSample,
    };

    setPending(true);
    try {
      const resume = await createResume(input);
      onClose();
      toast("Resume created.", "success");
      router.push(`/resume/${resume.id}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Start a new page."
      description="Name it for the role you have in mind. You can change every word, and the template, later."
      width="lg"
      footer={
        <>
          <button type="button" className="app-btn app-btn--quiet" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="create-resume-form"
            className="app-btn app-btn--primary"
            disabled={pending}
          >
            <Plus size={16} aria-hidden="true" />
            {pending ? "Creating…" : "Create resume"}
          </button>
        </>
      }
    >
      <form id="create-resume-form" onSubmit={create}>
        <label className="app-field-label" htmlFor="resume-name">
          Resume name
        </label>
        <input
          id="resume-name"
          className="app-input app-input--lg"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Product Designer — Northstar"
          autoComplete="off"
          maxLength={100}
          autoFocus
        />

        <fieldset className="app-fieldset">
          <legend>Choose a starting page</legend>
          <div className="create-template-grid">
            {TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "create-template-card",
                  template === item.id && "is-selected",
                )}
                onClick={() => setTemplate(item.id)}
                aria-pressed={template === item.id}
              >
                <TemplateMini template={item.id} />
                <span className="create-template-copy">
                  <strong>{item.name}</strong>
                  <small>{item.tone}</small>
                </span>
                <span className="create-template-check" aria-hidden="true">
                  <Check size={12} />
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="app-check-row">
          <input
            type="checkbox"
            checked={withSample}
            onChange={(event) => setWithSample(event.target.checked)}
          />
          <span className="app-check-box" aria-hidden="true">
            <Check size={12} />
          </span>
          <span>
            Start with example content
            <small>Useful for exploring the editor and score quickly.</small>
          </span>
        </label>
      </form>
    </AppModal>
  );
}
