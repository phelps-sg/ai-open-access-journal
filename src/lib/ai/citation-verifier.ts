// Citation verification pipeline — verifies APA-style references against
// Semantic Scholar and CrossRef to detect hallucinated citations.

// ----- Types -----

export interface ExtractedCitation {
  raw: string;
  authors: string;
  year: string;
  title: string;
}

export interface VerificationResult {
  citation: ExtractedCitation;
  status: "verified" | "unverified" | "partial_match";
  source: "semantic_scholar" | "crossref" | null;
  matchedTitle?: string;
  matchedAuthors?: string[];
  matchedYear?: number;
  doi?: string;
  url?: string;
  citationCount?: number;
  confidence: number;
  notes?: string;
}

export interface CitationValidation {
  verifiedAt: string;
  total: number;
  verified: number;
  unverified: number;
  partialMatch: number;
  results: VerificationResult[];
}

// ----- Helpers -----

/** Normalise a string for fuzzy comparison: lowercase, strip punctuation, collapse whitespace. */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Dice coefficient for two strings (bigram overlap). */
function dice(a: string, b: string): number {
  const na = normalise(a);
  const nb = normalise(b);
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;

  const bigrams = (s: string) => {
    const set = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bi = s.slice(i, i + 2);
      set.set(bi, (set.get(bi) ?? 0) + 1);
    }
    return set;
  };

  const aGrams = bigrams(na);
  const bGrams = bigrams(nb);
  let overlap = 0;
  for (const [bi, count] of aGrams) {
    overlap += Math.min(count, bGrams.get(bi) ?? 0);
  }
  const total = na.length - 1 + nb.length - 1;
  return (2 * overlap) / total;
}

/** Extract probable surnames from an author string. */
function extractSurnames(authors: string): string[] {
  // Handle "LastName, F. M., LastName, F. M., & LastName, F. M." APA style
  // Split on " & " or ", &" first to get individual authors
  const parts = authors.split(/,?\s*&\s*|\bet al\.?\b/i).filter(Boolean);

  const surnames: string[] = [];
  for (const part of parts) {
    // Each part may be "LastName, F. M." or just "LastName"
    const segments = part.split(",").map((s) => s.trim()).filter(Boolean);
    if (segments.length > 0) {
      // First segment before the comma is the surname
      const surname = segments[0].replace(/[^a-zA-Z\s-]/g, "").trim();
      if (surname.length > 1) {
        surnames.push(surname.toLowerCase());
      }
    }
  }
  return surnames;
}

/** Compute author overlap as fraction of expected surnames found in matched authors. */
function authorOverlap(expected: string, matched: string[]): number {
  const expectedSurnames = extractSurnames(expected);
  if (expectedSurnames.length === 0) return 0;

  const matchedLower = matched.map((a) => a.toLowerCase());
  let found = 0;
  for (const surname of expectedSurnames) {
    if (matchedLower.some((m) => m.includes(surname))) {
      found++;
    }
  }
  return found / expectedSurnames.length;
}

/** Compute title similarity — substring containment or Dice coefficient. */
function titleSimilarity(expected: string, candidate: string): number {
  const ne = normalise(expected);
  const nc = normalise(candidate);
  if (ne === nc) return 1;
  if (nc.includes(ne) || ne.includes(nc)) return 0.95;
  return dice(expected, candidate);
}

// ----- Extraction -----

/**
 * Extract individual APA citations from a paper's References section.
 * Expects the paper content structure with sections array where the last
 * section is typically "References".
 */
export function extractCitations(paper: {
  sections: { heading: string; body: string }[];
}): ExtractedCitation[] {
  const refsSection = paper.sections.find(
    (s) => s.heading.toLowerCase().replace(/[^a-z]/g, "") === "references"
  );
  if (!refsSection) return [];

  const body = refsSection.body;

  // Split references: each reference typically starts with a line beginning
  // with an author name. We split on blank-line-separated blocks or lines
  // that look like they start a new APA entry (Name, Initial.).
  const entries = body
    .split(/\n(?=\s*[A-Z][a-zA-Z'-]+,\s*[A-Z])/)
    .map((e) => e.trim())
    .filter((e) => e.length > 10);

  const citations: ExtractedCitation[] = [];

  for (const raw of entries) {
    // APA pattern: Authors (Year). Title. ...
    // Also handle Authors (Year, Month) and Authors (n.d.)
    const match = raw.match(
      /^(.+?)\s*\((\d{4}[a-z]?(?:,\s*\w+)?|n\.d\.)\)\.\s*(.+?)(?:\.\s|$)/
    );
    if (match) {
      citations.push({
        raw: raw.replace(/\n/g, " ").replace(/\s+/g, " ").trim(),
        authors: match[1].trim(),
        year: match[2].trim(),
        title: match[3].trim().replace(/\.$/, ""),
      });
    }
  }

  return citations;
}

// ----- API Clients -----

const SEMANTIC_SCHOLAR_BASE = "https://api.semanticscholar.org/graph/v1";
const CROSSREF_BASE = "https://api.crossref.org";

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": "AIOpenAccessJournal/1.0 (citation-verifier)" },
  });
  if (!res.ok) return null;
  return res.json();
}

interface SemanticScholarPaper {
  title?: string;
  authors?: { name: string }[];
  year?: number;
  externalIds?: { DOI?: string; ArXiv?: string };
  citationCount?: number;
  url?: string;
}

async function querySemanticScholar(
  citation: ExtractedCitation
): Promise<VerificationResult | null> {
  const query = encodeURIComponent(citation.title);
  const url = `${SEMANTIC_SCHOLAR_BASE}/paper/search?query=${query}&fields=title,authors,year,externalIds,citationCount,url&limit=3`;

  const data = (await fetchJson(url)) as {
    data?: SemanticScholarPaper[];
  } | null;
  if (!data?.data?.length) return null;

  let bestResult: VerificationResult | null = null;
  let bestConfidence = 0;

  for (const paper of data.data) {
    if (!paper.title) continue;

    const tSim = titleSimilarity(citation.title, paper.title);
    const matchedAuthorNames = (paper.authors ?? []).map((a) => a.name);
    const aOverlap = authorOverlap(citation.authors, matchedAuthorNames);
    const yearNum = parseInt(citation.year, 10);
    const ySim =
      isNaN(yearNum) || !paper.year
        ? 0
        : Math.abs(yearNum - paper.year) <= 1
          ? 1
          : 0;

    const confidence = tSim * 0.5 + aOverlap * 0.3 + ySim * 0.2;

    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestResult = {
        citation,
        status:
          confidence >= 0.7
            ? "verified"
            : confidence >= 0.4
              ? "partial_match"
              : "unverified",
        source: "semantic_scholar",
        matchedTitle: paper.title,
        matchedAuthors: matchedAuthorNames,
        matchedYear: paper.year ?? undefined,
        doi: paper.externalIds?.DOI ?? undefined,
        url: paper.url ?? undefined,
        citationCount: paper.citationCount ?? undefined,
        confidence: Math.round(confidence * 100) / 100,
      };
    }
  }

  return bestResult;
}

interface CrossRefItem {
  title?: string[];
  author?: { family?: string; given?: string }[];
  published?: { "date-parts"?: number[][] };
  DOI?: string;
  URL?: string;
}

async function queryCrossRef(
  citation: ExtractedCitation
): Promise<VerificationResult | null> {
  const query = encodeURIComponent(
    `${citation.authors} ${citation.title} ${citation.year}`
  );
  const url = `${CROSSREF_BASE}/works?query.bibliographic=${query}&rows=3&mailto=noreply@ai-journal.app`;

  const data = (await fetchJson(url)) as {
    message?: { items?: CrossRefItem[] };
  } | null;
  if (!data?.message?.items?.length) return null;

  let bestResult: VerificationResult | null = null;
  let bestConfidence = 0;

  for (const item of data.message.items) {
    const itemTitle = item.title?.[0] ?? "";
    if (!itemTitle) continue;

    const tSim = titleSimilarity(citation.title, itemTitle);
    const matchedAuthorNames = (item.author ?? []).map(
      (a) => `${a.given ?? ""} ${a.family ?? ""}`.trim()
    );
    const aOverlap = authorOverlap(citation.authors, matchedAuthorNames);
    const itemYear = item.published?.["date-parts"]?.[0]?.[0];
    const yearNum = parseInt(citation.year, 10);
    const ySim =
      isNaN(yearNum) || !itemYear
        ? 0
        : Math.abs(yearNum - itemYear) <= 1
          ? 1
          : 0;

    const confidence = tSim * 0.5 + aOverlap * 0.3 + ySim * 0.2;

    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestResult = {
        citation,
        status:
          confidence >= 0.7
            ? "verified"
            : confidence >= 0.4
              ? "partial_match"
              : "unverified",
        source: "crossref",
        matchedTitle: itemTitle,
        matchedAuthors: matchedAuthorNames,
        matchedYear: itemYear ?? undefined,
        doi: item.DOI ?? undefined,
        url: item.URL ?? undefined,
        confidence: Math.round(confidence * 100) / 100,
      };
    }
  }

  return bestResult;
}

// ----- Public API -----

/** Verify a single citation: try Semantic Scholar, then fall back to CrossRef. */
export async function verifyCitation(
  citation: ExtractedCitation
): Promise<VerificationResult> {
  // Try Semantic Scholar first
  try {
    const ssResult = await querySemanticScholar(citation);
    if (ssResult && ssResult.confidence >= 0.4) return ssResult;
  } catch {
    // fall through to CrossRef
  }

  // Fall back to CrossRef
  try {
    const crResult = await queryCrossRef(citation);
    if (crResult) return crResult;
  } catch {
    // fall through to unverified
  }

  return {
    citation,
    status: "unverified",
    source: null,
    confidence: 0,
    notes: "No matching results found in Semantic Scholar or CrossRef",
  };
}

/** Rate-limited delay between API calls. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verify all citations in a paper. Extracts references, queries APIs
 * sequentially with rate limiting, and returns aggregate results.
 */
export async function verifyCitations(paper: {
  sections: { heading: string; body: string }[];
}): Promise<CitationValidation> {
  const citations = extractCitations(paper);
  const results: VerificationResult[] = [];

  for (let i = 0; i < citations.length; i++) {
    if (i > 0) await delay(1000); // ~1 req/sec rate limit
    const result = await verifyCitation(citations[i]);
    results.push(result);
  }

  return {
    verifiedAt: new Date().toISOString(),
    total: results.length,
    verified: results.filter((r) => r.status === "verified").length,
    unverified: results.filter((r) => r.status === "unverified").length,
    partialMatch: results.filter((r) => r.status === "partial_match").length,
    results,
  };
}
