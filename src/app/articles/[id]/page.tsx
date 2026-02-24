"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
}

export default function ArticlePage() {
  const params = useParams();
  const [data, setData] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const { submission, author, paper, reviews } = data;

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
          <ReactMarkdown>{paper.content.abstract}</ReactMarkdown>
        </div>
      </section>

      {/* Sections */}
      {paper.content.sections.map((section, i) => (
        <section key={i} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <ReactMarkdown>{section.body}</ReactMarkdown>
          </div>
        </section>
      ))}

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
