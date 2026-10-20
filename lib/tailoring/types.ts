export type KeywordImportance = "high" | "medium" | "low";

export type TailoringKeyword = {
  term: string;
  importance: KeywordImportance;
  evidenceQuote: string;
  found: boolean;
};

export type TailoringSuggestions = {
  summary: {
    original: string;
    suggested: string;
    sourceQuotes: string[];
  };
  bullets: Array<{
    id: string;
    original: string;
    suggested: string;
    sourceQuotes: string[];
  }>;
};
