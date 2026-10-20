import "server-only";
import type { ReactNode } from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDateRange, splitSkills } from "@/lib/resume/format";
import { RESUME_FONT } from "@/lib/resume/design";
import type { ResumeContent } from "@/lib/resume/schema";

const styles = StyleSheet.create({
  page: {
    size: "A4",
    paddingTop: 42,
    paddingBottom: 42,
    paddingHorizontal: 42,
    fontFamily: RESUME_FONT.regular,
    fontSize: 10,
    lineHeight: 1.32,
    color: "#171717",
  },
  name: {
    fontFamily: RESUME_FONT.bold,
    fontSize: 19,
    lineHeight: 1.15,
    marginBottom: 2,
  },
  contact: {
    fontSize: 9.5,
    color: "#525252",
    marginBottom: 12,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: RESUME_FONT.bold,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    borderBottomWidth: 0.75,
    borderBottomColor: "#d4d4d4",
    paddingBottom: 2,
    marginBottom: 5,
  },
  entry: {
    marginBottom: 7,
  },
  entryTitle: {
    fontFamily: RESUME_FONT.semibold,
    fontSize: 10,
  },
  meta: {
    fontSize: 9.5,
    color: "#525252",
    marginTop: 1,
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 1.5,
  },
  bulletDot: {
    width: 9,
  },
  bulletText: {
    flex: 1,
  },
  paragraph: {
    marginBottom: 2,
  },
});

function Header({ content }: { content: ResumeContent }) {
  const contact = [
    content.contact.email,
    content.contact.phone,
    content.contact.location,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" | ");

  return (
    <View>
      <Text style={styles.name}>{content.contact.fullName.trim()}</Text>
      {contact ? <Text style={styles.contact}>{contact}</Text> : null}
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullets({ bullets }: { bullets: string[] }) {
  const filled = bullets.map((bullet) => bullet.trim()).filter(Boolean);
  if (filled.length === 0) return null;

  return (
    <View>
      {filled.map((bullet, index) => (
        <View key={index} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}
    </View>
  );
}

export function ResumeDocument({ content }: { content: ResumeContent }) {
  const experience = content.experience.filter(
    (entry) =>
      entry.title.trim() ||
      entry.company.trim() ||
      entry.bullets.some((bullet) => bullet.trim()),
  );
  const education = content.education.filter(
    (entry) =>
      entry.school.trim() ||
      entry.degree.trim() ||
      entry.major.trim() ||
      entry.coursework.trim() ||
      entry.honors.trim(),
  );
  const projects = content.projects.filter(
    (entry) =>
      entry.name.trim() ||
      entry.link.trim() ||
      entry.bullets.some((bullet) => bullet.trim()),
  );
  const skills = splitSkills(content.skills);

  return (
    <Document title={`${content.contact.fullName || "Resume"} - Resume`}>
      <Page size="A4" style={styles.page} wrap>
        <Header content={content} />

        {content.summary.trim() ? (
          <Section title="Summary">
            <Text>{content.summary.trim()}</Text>
          </Section>
        ) : null}

        {experience.length > 0 ? (
          <Section title="Experience">
            {experience.map((entry) => {
              const dates = formatDateRange(
                entry.startDate,
                entry.endDate,
                entry.current,
              );
              const header = [entry.title.trim(), entry.company.trim(), dates]
                .filter(Boolean)
                .join(" | ");
              return (
                <View key={entry.id} style={styles.entry}>
                  <Text style={styles.entryTitle}>{header}</Text>
                  {entry.location.trim() ? (
                    <Text style={styles.meta}>{entry.location.trim()}</Text>
                  ) : null}
                  <Bullets bullets={entry.bullets} />
                </View>
              );
            })}
          </Section>
        ) : null}

        {education.length > 0 ? (
          <Section title="Education">
            {education.map((entry) => {
              const dates = formatDateRange(entry.startDate, entry.endDate, false);
              const header = [
                entry.degree.trim(),
                entry.major.trim(),
                entry.school.trim(),
                dates,
              ]
                .filter(Boolean)
                .join(" | ");
              return (
                <View key={entry.id} style={styles.entry}>
                  <Text style={styles.entryTitle}>{header}</Text>
                  {entry.location.trim() ? (
                    <Text style={styles.meta}>{entry.location.trim()}</Text>
                  ) : null}
                  {entry.gpa.trim() ? (
                    <Text style={styles.meta}>GPA: {entry.gpa.trim()}</Text>
                  ) : null}
                  {entry.coursework.trim() ? (
                    <Text style={styles.paragraph}>
                      Coursework: {entry.coursework.trim()}
                    </Text>
                  ) : null}
                  {entry.honors.trim() ? (
                    <Text style={styles.paragraph}>
                      Honors: {entry.honors.trim()}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </Section>
        ) : null}

        {projects.length > 0 ? (
          <Section title="Projects">
            {projects.map((entry) => {
              const dates = formatDateRange(entry.startDate, entry.endDate, false);
              const header = [entry.name.trim(), entry.link.trim(), dates]
                .filter(Boolean)
                .join(" | ");
              return (
                <View key={entry.id} style={styles.entry}>
                  <Text style={styles.entryTitle}>{header}</Text>
                  <Bullets bullets={entry.bullets} />
                </View>
              );
            })}
          </Section>
        ) : null}

        {skills.length > 0 ? (
          <Section title="Skills">
            <Text>{skills.join(", ")}</Text>
          </Section>
        ) : null}
      </Page>
    </Document>
  );
}
