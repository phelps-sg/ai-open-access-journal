"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  studyType: string;
  keywords: string[] | null;
  author: { name: string; image: string | null };
  abstract: string;
  publishedAt: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Published Articles</h1>
      <p className="mt-2 text-muted-foreground">
        Peer-reviewed research with full transparency — pre-registrations,
        AI-authored papers, and open reviews.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : articles.length === 0 ? (
        <Card className="mt-12">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No articles yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Published articles will appear here once submissions complete the
              review process.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-6">
          {articles.map((article) => (
            <Link key={article.id} href={`/articles/${article.id}`}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {article.title}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {article.author.name} &middot;{" "}
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {article.studyType.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.abstract}
                  </p>
                  {article.keywords && article.keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {article.keywords.map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
