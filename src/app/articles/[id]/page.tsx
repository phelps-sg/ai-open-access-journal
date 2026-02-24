"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ChevronDown, ChevronRight, ClipboardCheck, Bot, FileText, AlertTriangle, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface ArticleData {
  submission: {
    id: string;
    title: string;
    studyType: string;
    keywords: string[] | null;
    preRegistration: Record<string, unknown>;
    results: Record<string, unknown> | null;
    createdAt: string;
  };
  author: { name: string; image: string | null };
  paper: {
    version: number;
    content: {
      title: string;
      abstract: string;
      sections: { heading: string; body: string }[];
    };
    model: string | null;
    generatedAt: string;
  };
  reviews: {
    id: string;
    reviewerName: string;
    scores: Record<string, number>;
    recommendation: string;
    summary: string;
    sectionFeedback: { section: string; comment: string }[];
    createdAt: string;
  }[];
  auditTrail: {
    id: string;
    actionType: string;
    reasoning: string | null;
    data: Record<string, unknown> | null;
    createdAt: string;
  }[];
}

export default function ArticlePage() {
  const params = useParams();
  const [data, setData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [preRegOpen, setPreRegOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  // Auto-expand and scroll to section from URL hash
  useEffect(() => {
    if (!data || loading) return;
    const hash = window.location.hash.replace("#", "");
    if (hash === "pre-registration") setPreRegOpen(true);
    if (hash === "results-data") setResultsOpen(true);
    if (hash === "audit-trail") setAuditOpen(true);
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [data, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
      </div>
    );
  }

  const { submission, author, paper, reviews, auditTrail } = data;
  const isDemo = submission.keywords?.includes("demo") ?? false;

  return (
    <article className="container mx-auto max-w-4xl px-4 py-16 relative">
      {/* Demo watermark overlay */}
      {isDemo && (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, transparent, transparent 80px, rgba(239,68,68,0.07) 80px, rgba(239,68,68,0.07) 82px)",
              }}
            />
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-32 -rotate-45 scale-150">
              {Array.from({ length: 20 }).map((_, i) => (
                <span
                  key={i}
                  className="text-red-500/10 text-4xl font-bold whitespace-nowrap select-none"
                >
                  DEMO &mdash; DO NOT CITE
                </span>
              ))}
            </div>
          </div>
          <div className="mb-8 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold text-lg">
              <AlertTriangle className="h-5 w-5" />
              DEMONSTRATION ONLY &mdash; DO NOT CITE
            </div>
            <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
              This paper was generated with synthetic data for platform testing purposes.
              It does not represent real research findings.
            </p>
          </div>
        </>
      )}

      {/* Header */}
      <header className="text-center">
        <Badge variant="outline" className="mb-4">
          {submission.studyType.replace("_", " ")}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {paper.content.title}
        </h1>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={author.image ?? undefined} />
            <AvatarFallback>
              {author.name?.charAt(0)?.toUpperCase() ?? "A"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{author.name}</span>
          <span className="text-sm text-muted-foreground">
            &middot; Published{" "}
            {new Date(submission.createdAt).toLocaleDateString()}
          </span>
        </div>
        {submission.keywords && submission.keywords.filter((kw) => kw !== "demo").length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-1">
            {submission.keywords.filter((kw) => kw !== "demo").map((kw) => (
              <Badge key={kw} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <Separator className="my-8" />

      {/* Abstract */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Abstract</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{paper.content.abstract}</ReactMarkdown>
        </div>
      </section>

      {/* Sections */}
      {paper.content.sections.map((section, i) => (
        <section key={i} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{section.body}</ReactMarkdown>
          </div>
        </section>
      ))}

      <Separator className="my-8" />

      {/* Pre-Registration */}
      {submission.preRegistration && (
        <section id="pre-registration" className="mb-8">
          <button
            onClick={() => setPreRegOpen(!preRegOpen)}
            className="flex items-center gap-2 text-2xl font-bold mb-4 hover:text-primary transition-colors"
          >
            <ClipboardCheck className="h-6 w-6" />
            Pre-Registration
            {preRegOpen ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
          {preRegOpen && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                {Object.entries(submission.preRegistration).map(([key, value]) => {
                  if (key === "studyType" || key === "keywords") return null;
                  const label = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase());
                  return (
                    <div key={key}>
                      <h4 className="text-sm font-semibold text-foreground">{label}</h4>
                      {typeof value === "object" && value !== null ? (
                        <div className="mt-1 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                          {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                            <div key={k}>
                              <span className="font-medium capitalize">{k}:</span>{" "}
                              {String(v)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {String(value)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Results Data */}
      {submission.results && (
        <section id="results-data" className="mb-8">
          <button
            onClick={() => setResultsOpen(!resultsOpen)}
            className="flex items-center gap-2 text-2xl font-bold mb-4 hover:text-primary transition-colors"
          >
            <BarChart3 className="h-6 w-6" />
            Results Data
            {resultsOpen ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
          {resultsOpen && (() => {
            const r = submission.results as Record<string, unknown>;
            const dataFiles = r.dataFiles as { label: string; url: string; description?: string }[] | undefined;
            const codeRepository = r.codeRepository as string | undefined;
            const dataManifest = r.dataManifest as string | undefined;
            const deviations = r.deviations as string | undefined;
            return (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {dataFiles && dataFiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Data Files</h4>
                      <div className="space-y-2">
                        {dataFiles.map((f, i) => (
                          <div key={i} className="rounded-md bg-muted p-3 text-sm">
                            <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">
                              {f.label}
                            </a>
                            {f.description && (
                              <p className="text-muted-foreground mt-1">{f.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {codeRepository && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Code Repository</h4>
                      <a href={codeRepository} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline mt-1 inline-block">
                        {codeRepository}
                      </a>
                    </div>
                  )}
                  {dataManifest && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Data Manifest</h4>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{dataManifest}</p>
                    </div>
                  )}
                  {deviations && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Deviations from Pre-registration</h4>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{deviations}</p>
                    </div>
                  )}
                  {/* Fallback for old-format results without dataFiles */}
                  {!dataFiles && Object.entries(r).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                    const strVal = String(value);
                    const isUrl = strVal.startsWith("http://") || strVal.startsWith("https://");
                    return (
                      <div key={key}>
                        <h4 className="text-sm font-semibold text-foreground">{label}</h4>
                        {isUrl ? (
                          <a href={strVal} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline mt-1 inline-block">{strVal}</a>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{strVal}</p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })()}
        </section>
      )}

      {/* Audit Trail */}
      {auditTrail && auditTrail.length > 0 && (
        <section id="audit-trail" className="mb-8">
          <button
            onClick={() => setAuditOpen(!auditOpen)}
            className="flex items-center gap-2 text-2xl font-bold mb-4 hover:text-primary transition-colors"
          >
            <FileText className="h-6 w-6" />
            Audit Trail
            <Badge variant="secondary" className="ml-1">{auditTrail.length}</Badge>
            {auditOpen ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
          {auditOpen && (
            <div className="space-y-4">
              {auditTrail.map((action) => (
                <Card key={action.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm">
                          {action.actionType.replace(/_/g, " ").replace(/^./, (s) => s.toUpperCase())}
                        </CardTitle>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(action.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  {action.reasoning && (
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{action.reasoning}</ReactMarkdown>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <Separator className="my-8" />

      {/* Open Peer Reviews */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Open Peer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews available.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Review by {review.reviewerName}
                    </CardTitle>
                    <Badge
                      variant={
                        review.recommendation === "accept"
                          ? "default"
                          : review.recommendation === "reject"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {review.recommendation.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scores */}
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(review.scores).map(([key, val]) => (
                      <div key={key} className="text-center">
                        <div className="text-lg font-bold">{val}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {key}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="text-sm font-medium mb-1">Summary</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {review.summary}
                    </p>
                  </div>

                  {/* Section feedback */}
                  {review.sectionFeedback && review.sectionFeedback.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Section Feedback
                      </h4>
                      <div className="space-y-2">
                        {review.sectionFeedback.map((fb, i) => (
                          <div
                            key={i}
                            className="rounded-md bg-muted p-2 text-sm"
                          >
                            <span className="font-medium">{fb.section}:</span>{" "}
                            <span className="text-muted-foreground">
                              {fb.comment}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Demo bottom banner */}
      {isDemo && (
        <div className="mt-8 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold">
            <AlertTriangle className="h-5 w-5" />
            DEMONSTRATION ONLY &mdash; DO NOT CITE
          </div>
        </div>
      )}

      {/* Metadata footer */}
      <Separator className="my-8" />
      <footer className="text-center text-xs text-muted-foreground">
        <p>
          This paper was AI-authored from a pre-registered design. All reviews
          are published openly.
        </p>
        <p className="mt-1">
          Paper version {paper.version}
          {paper.model && <> &middot; Model: {paper.model}</>}
          {" "}&middot; Generated{" "}
          {new Date(paper.generatedAt).toLocaleDateString()}
        </p>
      </footer>
    </article>
  );
}
