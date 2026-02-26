"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Loader2, MessageSquarePlus } from "lucide-react";

interface UserReview {
  reviewId: string;
  recommendation: string;
  createdAt: string;
  paperId: string;
  submissionId: string;
  submissionTitle: string;
  submissionStatus: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews/mine")
      .then((res) => (res.ok ? res.json() : []))
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
        <p className="mt-2 text-muted-foreground">
          Papers assigned to you for peer review.
        </p>
        <div className="mt-8 flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
      <p className="mt-2 text-muted-foreground">
        Papers assigned to you for peer review.
      </p>

      {reviews.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Reviews you complete are published openly and attributed to you —
              building a track record of your contributions to the scientific
              process.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {reviews.map((review) => {
            const canContributePerspective =
              review.submissionStatus === "accepted" ||
              review.submissionStatus === "published";

            return (
              <Card key={review.reviewId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {review.submissionTitle}
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
                      {review.recommendation?.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reviewed {new Date(review.createdAt).toLocaleDateString()}
                    {" "}&middot;{" "}
                    Status: {review.submissionStatus.replace("_", " ")}
                  </p>
                </CardHeader>
                {canContributePerspective && (
                  <CardContent>
                    <Link
                      href={`/dashboard/reviews/${review.submissionId}/perspective`}
                    >
                      <Button variant="outline" size="sm">
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                        Contribute Perspective
                      </Button>
                    </Link>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
