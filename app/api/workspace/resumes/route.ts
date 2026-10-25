import { requireUserForApi } from "@/lib/auth/dal";
import { listResumeRows, toResumeRecord } from "@/lib/workspace";

export async function GET() {
  try {
    const user = await requireUserForApi();
    const rows = await listResumeRows(user.id);
    return Response.json(
      { resumes: rows.map(toResumeRecord) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
