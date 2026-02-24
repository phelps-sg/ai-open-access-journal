import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export interface PaperSection {
  heading: string;
  body: string;
}

export interface PaperContent {
  title: string;
  abstract: string;
  sections: PaperSection[];
}

type SectionName =
  | "title_abstract"
  | "introduction"
  | "methods"
  | "results"
  | "discussion"
  | "conclusion";

const SYSTEM_PROMPT = `You are a scientific paper writer for an AI-powered open-access journal. Your core principle is FAITHFUL REPORTING.

Rules:
1. Report findings exactly as they are — positive, negative, or null.
2. NEVER spin, exaggerate, or downplay results.
3. Use precise statistical language. Report effect sizes and confidence intervals.
4. If results contradict hypotheses, state this clearly and without hedging.
5. If there are deviations from the pre-registered plan, flag them prominently.
6. Write in clear, accessible scientific prose.
7. Do not add interpretations beyond what the data supports.`;

function buildContext(preRegistration: Record<string, unknown>, results: Record<string, unknown>) {
  return `## Pre-Registration
${JSON.stringify(preRegistration, null, 2)}

## Results
${JSON.stringify(results, null, 2)}`;
}

export async function generatePaperSection(
  section: SectionName,
  preRegistration: Record<string, unknown>,
  results: Record<string, unknown>,
  previousSections: PaperSection[] = []
): Promise<string> {
  const context = buildContext(preRegistration, results);
  const prevContext = previousSections.length > 0
    ? `\n\n## Previously Generated Sections\n${previousSections.map((s) => `### ${s.heading}\n${s.body}`).join("\n\n")}`
    : "";

  const prompts: Record<string, string> = {
    title_abstract: `Based on the pre-registration and results below, generate:
1. A clear, descriptive title
2. A structured abstract (Background, Methods, Results, Conclusions)

Format your response as:
TITLE: [title]

ABSTRACT:
[abstract text]

${context}`,
    introduction: `Write the Introduction section for this paper. Include:
- Background and motivation from the pre-registration
- Research question and hypotheses
- Brief overview of the approach

Keep it concise and grounded in the pre-registration.
${context}${prevContext}`,
    methods: `Write the Methods section. Include:
- Study design
- Participants/data
- Variables and measures
- Analysis plan
- Any deviations from pre-registration (flagged clearly)

Be precise and detailed enough for replication.
${context}${prevContext}`,
    results: `Write the Results section. Include:
- All pre-registered analyses
- Statistical test results with effect sizes and confidence intervals
- Whether each hypothesis was supported or not
- Any exploratory analyses (clearly labelled)

Report faithfully. Do NOT spin or selectively report.
${context}${prevContext}`,
    discussion: `Write the Discussion section. Include:
- Summary of key findings
- How results relate to hypotheses
- Limitations
- Implications
- Suggestions for future research

If results were null or negative, discuss this honestly.
${context}${prevContext}`,
    conclusion: `Write a brief Conclusion section summarizing the main findings and their significance.
Be balanced and avoid overstating implications.
${context}${prevContext}`,
  };

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: SYSTEM_PROMPT,
    prompt: prompts[section],
    maxOutputTokens: 2000,
  });

  return text;
}

export async function generateFullPaper(
  preRegistration: Record<string, unknown>,
  results: Record<string, unknown>
): Promise<PaperContent> {
  const sections: PaperSection[] = [];

  // Step 1: Title and abstract
  const titleAbstract = await generatePaperSection(
    "title_abstract",
    preRegistration,
    results
  );

  const titleMatch = titleAbstract.match(/TITLE:\s*(.+)/);
  const abstractMatch = titleAbstract.match(/ABSTRACT:\s*([\s\S]+)/);
  const title = titleMatch?.[1]?.trim() ?? "Untitled Paper";
  const abstract = abstractMatch?.[1]?.trim() ?? titleAbstract;

  // Step 2: Generate each section sequentially, feeding context forward
  for (const sectionName of ["introduction", "methods", "results", "discussion", "conclusion"] as const) {
    const headingMap: Record<string, string> = {
      introduction: "Introduction",
      methods: "Methods",
      results: "Results",
      discussion: "Discussion",
      conclusion: "Conclusion",
    };

    const body = await generatePaperSection(
      sectionName,
      preRegistration,
      results,
      sections
    );

    sections.push({
      heading: headingMap[sectionName],
      body,
    });
  }

  return { title, abstract, sections };
}

export function paperToMarkdown(paper: PaperContent): string {
  let md = `# ${paper.title}\n\n## Abstract\n\n${paper.abstract}\n\n`;
  for (const section of paper.sections) {
    md += `## ${section.heading}\n\n${section.body}\n\n`;
  }
  return md;
}
