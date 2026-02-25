"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, ArrowLeft, CheckCircle2, XCircle, AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface VerificationResult {
  citation: { raw: string; title: string; authors: string; year: string };
  status: "verified" | "unverified" | "partial_match";
  source: "semantic_scholar" | "crossref" | null;
  matchedTitle?: string;
  doi?: string;
  url?: string;
  citationCount?: number;
  confidence: number;
}

interface CitationValidation {
  verifiedAt: string;
  total: number;
  verified: number;
  unverified: number;
  partialMatch: number;
  results: VerificationResult[];
}

interface Paper {
  id: string;
  submissionId: string;
  version: number;
  content: {
    title: string;
    abstract: string;
    sections: { heading: string; body: string }[];
  };
  markdown: string;
  model: string | null;
  generatedAt: string;
}

export default function PaperPage() {
  const params = useParams();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [citationValidation, setCitationValidation] = useState<CitationValidation | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Strip leading "# Heading" from section body since the page renders headings separately,
  // and remove any embedded References sections (LLM sometimes appends these to each section)
  const cleanSectionBody = (body: string) =>
    body
      .replace(/^#\s+.+\n+/, "")
      .replace(/\n+\*{0,2}#{0,3}\s*References\*{0,2}\s*\n[\s\S]*$/i, "");

  const fetchCitations = () => {
    fetch(`/api/submissions/${params.id}/citations`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.citationValidations) {
          setCitationValidation(data.citationValidations);
        }
      })
      .catch(() => {});
  };

  const reverify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/submissions/${params.id}/citations`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Verification failed");
      const data = await res.json();
      setCitationValidation(data.citationValidations);
      toast.success("Citation verification complete!");
    } catch {
      toast.error("Failed to verify citations");
    } finally {
      setVerifying(false);
    }
  };

  const fetchPaper = () => {
    fetch(`/api/submissions/${params.id}/paper`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to load paper");
        return res.json();
      })
      .then((data) => {
        setPaper(data);
        if (data) fetchCitations();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPaper();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const generatePaper = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/submissions/${params.id}/generate`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const newPaper = await res.json();
      setPaper(newPaper);
      toast.success("Paper generated successfully!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate paper");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/submissions/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Paper</h1>
          {paper && (
            <Badge variant="outline">Version {paper.version}</Badge>
          )}
        </div>
        <Button onClick={generatePaper} disabled={generating}>
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {paper ? "Regenerate" : "Generate Paper"}
        </Button>
      </div>

      {generating && (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-medium">Generating paper...</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The AI is writing your paper section by section. This may take a
              minute.
            </p>
          </CardContent>
        </Card>
      )}

      {!generating && !paper && (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-medium">No paper generated yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Click &quot;Generate Paper&quot; to create an AI-authored write-up
              from your pre-registration and results.
            </p>
          </CardContent>
        </Card>
      )}

      {!generating && paper && (
        <div className="mt-8 space-y-6">
          {/* Title */}
          <Card>
            <CardContent className="py-8">
              <h2 className="text-center text-2xl font-bold">
                {paper.content.title}
              </h2>
            </CardContent>
          </Card>

          {/* Abstract */}
          <Card>
            <CardHeader>
              <CardTitle>Abstract</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{cleanSectionBody(paper.content.abstract)}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          {paper.content.sections.map((section, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{section.heading}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{cleanSectionBody(section.body)}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Citation Verification */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <CardTitle>Citation Verification</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reverify}
                  disabled={verifying}
                >
                  {verifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {citationValidation ? "Re-verify" : "Verify"} Citations
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!citationValidation ? (
                <p className="text-sm text-muted-foreground">
                  Citation verification has not been run yet. Click
                  &quot;Verify Citations&quot; to check references against
                  Semantic Scholar and CrossRef.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {citationValidation.verified} verified
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="h-4 w-4" />
                      {citationValidation.partialMatch} partial
                    </span>
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <XCircle className="h-4 w-4" />
                      {citationValidation.unverified} unverified
                    </span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      Checked {new Date(citationValidation.verifiedAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Per-citation rows */}
                  <div className="space-y-2">
                    {citationValidation.results.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-md border p-3 text-sm"
                      >
                        {r.status === "verified" ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                        ) : r.status === "partial_match" ? (
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {r.citation.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {r.citation.authors} ({r.citation.year})
                            {r.source && (
                              <> &middot; via {r.source.replace("_", " ")}</>
                            )}
                            {r.citationCount != null && (
                              <> &middot; {r.citationCount} citations</>
                            )}
                          </p>
                        </div>
                        {r.doi && (
                          <a
                            href={`https://doi.org/${r.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <p className="text-center text-xs text-muted-foreground">
            Generated on{" "}
            {new Date(paper.generatedAt).toLocaleDateString()} | Version{" "}
            {paper.version}
            {paper.model && <> | Model: {paper.model}</>}
          </p>
        </div>
      )}
    </div>
  );
}
