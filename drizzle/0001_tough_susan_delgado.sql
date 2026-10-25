ALTER TABLE "resumes" ADD COLUMN "target_role" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "template" text DEFAULT 'modern' NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "accent" text DEFAULT '#416af5' NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "density" text DEFAULT 'comfortable' NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "last_tailored_for" jsonb;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_template_check" CHECK ("resumes"."template" in ('modern','classic','editorial'));--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_density_check" CHECK ("resumes"."density" in ('compact','comfortable','airy'));