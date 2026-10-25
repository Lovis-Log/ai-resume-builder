import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const userId = process.argv[2];

if (!userId) {
  console.error(
    "Usage: npm run seed -- <neon-auth-user-id>\n" +
      "Sign in once so the profile exists, then copy the user id from the database.",
  );
  process.exit(1);
}

const { closePool, db } = await import("../lib/db/client");
const { resumes } = await import("../lib/db/schema");
const { SAMPLE_RESUME_CONTENT } = await import("../lib/resume/defaults");

const [resume] = await db
  .insert(resumes)
  .values({
    userId,
    title: "Sample Resume — Software Engineer",
    content: SAMPLE_RESUME_CONTENT,
  })
  .returning({ id: resumes.id });

console.log(`Created sample resume ${resume.id} for ${userId}.`);
await closePool();
