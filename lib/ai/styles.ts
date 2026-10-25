export type AiSummaryStyle = "measured" | "concise" | "impact";

export const AI_SUMMARY_STYLES: {
  id: AiSummaryStyle;
  label: string;
  description: string;
}[] = [
  {
    id: "measured",
    label: "Measured",
    description: "Warm, specific, and calm.",
  },
  {
    id: "concise",
    label: "Concise",
    description: "Two short, high-signal sentences.",
  },
  {
    id: "impact",
    label: "Impact-led",
    description: "Lead with the outcomes.",
  },
];
