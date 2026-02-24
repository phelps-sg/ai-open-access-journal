import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
      <p className="mt-2 text-muted-foreground">
        Papers assigned to you for peer review.
      </p>

      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No reviews assigned</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ll be notified when papers are assigned for your review.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
