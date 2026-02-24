"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FlaskConical, Microscope, RotateCcw, XCircle } from "lucide-react";

const studyTypes = [
  {
    value: "empirical" as const,
    label: "Empirical Study",
    description: "Hypothesis-driven experiment with pre-registered design, sampling plan, and analysis strategy.",
    icon: FlaskConical,
  },
  {
    value: "simulation" as const,
    label: "Simulation Study",
    description: "Computational experiment using the ADEMP framework.",
    icon: Microscope,
  },
  {
    value: "replication" as const,
    label: "Replication Study",
    description: "Reproduce findings from published work with pre-registered design.",
    icon: RotateCcw,
  },
  {
    value: "negative_results" as const,
    label: "Negative Results",
    description: "Study where expected effect was not found, with equivalence testing.",
    icon: XCircle,
  },
];

type StudyType = "empirical" | "simulation" | "replication" | "negative_results";

interface StudyTypeSelectorProps {
  value: StudyType | null;
  onChange: (type: StudyType) => void;
}

export function StudyTypeSelector({ value, onChange }: StudyTypeSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {studyTypes.map((type) => (
        <Card
          key={type.value}
          className={cn(
            "cursor-pointer transition-colors hover:border-primary",
            value === type.value && "border-primary bg-primary/5"
          )}
          onClick={() => onChange(type.value)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <type.icon className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{type.label}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
