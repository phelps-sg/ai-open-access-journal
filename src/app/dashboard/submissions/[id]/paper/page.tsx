"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

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
  generatedAt: string;
}

export default function PaperPage() {
  const params = useParams();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPaper = () => {
    fetch(`/api/submissions/${params.id}/paper`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to load paper");
        return res.json();
      })
      .then(setPaper)
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
                <ReactMarkdown>{paper.content.abstract}</ReactMarkdown>
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
                  <ReactMarkdown>{section.body}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Metadata */}
          <p className="text-center text-xs text-muted-foreground">
            Generated on{" "}
            {new Date(paper.generatedAt).toLocaleDateString()} | Version{" "}
            {paper.version}
          </p>
        </div>
      )}
    </div>
  );
}
