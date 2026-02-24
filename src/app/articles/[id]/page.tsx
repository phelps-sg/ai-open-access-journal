"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ChevronDown, ChevronRight, ClipboardCheck, Bot, FileText } from "lucide-react";
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

  return (
    <article className="container mx-auto max-w-4xl px-4 py-16">
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
        {submission.keywords && submission.keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-1">
            {submission.keywords.map((kw) => (
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
        <section className="mb-8">
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

      {/* Audit Trail */}
      {auditTrail && auditTrail.length > 0 && (
        <section className="mb-8">
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

      {/* Metadata footer */}
      <Separator className="my-8" />
      <footer className="text-center text-xs text-muted-foreground">
        <p>
          This paper was AI-authored from a pre-registered design. All reviews
          are published openly.
        </p>
        <p className="mt-1">
          Paper version {paper.version} &middot; Generated{" "}
          {new Date(paper.generatedAt).toLocaleDateString()}
        </p>
      </footer>
    </article>
  );
}
