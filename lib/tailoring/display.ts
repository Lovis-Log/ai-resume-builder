export function extractJobMeta(jobDescription: string): {
  role: string;
  company: string;
} {
  const lines = jobDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const role = (lines[0] || "Product Designer").split("·")[0].trim();
  let company = "";

  if (lines[1]) {
    const possible = lines[1].split("·")[0].trim();
    if (possible && possible.length < 48 && !/^(remote|hybrid|onsite)/i.test(possible)) {
      company = possible;
    }
  }

  return { role, company: company || "the team" };
}

export function tailorMatchLabel(percent: number): string {
  if (percent >= 80) return "Strong overlap";
  if (percent >= 60) return "Close match";
  return "Worth tailoring";
}
