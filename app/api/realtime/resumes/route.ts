import { requireUserForApi } from "@/lib/auth/dal";
import { sealResumesQuery } from "@/lib/realtime/resumes";

export async function POST() {
  try {
    const user = await requireUserForApi();
    return Response.json(await sealResumesQuery(user.id));
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
