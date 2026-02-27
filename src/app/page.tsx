import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  FlaskConical,
  BarChart3,
  FileText,
  Users,
  CheckCircle,
  ArrowRight,
  Microscope,
  RotateCcw,
  XCircle,
} from "lucide-react";

const workflowSteps = [
  {
    icon: FlaskConical,
    title: "1. Pre-register",
    description:
      "Submit your study design, hypotheses, and analysis plan before collecting data.",
  },
  {
    icon: BarChart3,
    title: "2. Submit Results",
    description:
      "Upload your raw results and data. No narrative framing, just the findings.",
  },
  {
    icon: FileText,
    title: "3. AI Writes the Paper",
    description:
      "AI faithfully reports your findings from the pre-registered design. No spin, no p-hacking. The entire generation process is audited and visible in the published article.",
  },
  {
    icon: Users,
    title: "4. Human Peer Review",
    description:
      "Expert reviewers evaluate methodology and significance. Every review is published, attributed, and citable — building the reviewer's public track record alongside the author's.",
  },
  {
    icon: CheckCircle,
    title: "5. Publication",
    description:
      "Accepted papers are published with full transparency: pre-registration, data, reviews, and a complete audit trail of every editorial decision.",
  },
];

const studyTypes = [
  {
    icon: FlaskConical,
    title: "Empirical Studies",
    description:
      "Hypothesis-driven experiments with pre-registered designs, sampling plans, and analysis strategies.",
  },
  {
    icon: Microscope,
    title: "Simulation Studies",
    description:
      "Computational experiments using the ADEMP framework: Aims, Data-generating mechanisms, Estimands, Methods, Performance.",
  },
  {
    icon: RotateCcw,
    title: "Replication Studies",
    description:
      "Reproduce findings from published work with pre-registered replication designs and success criteria.",
  },
  {
    icon: XCircle,
    title: "Negative Results",
    description:
      "Studies that didn't find the expected effect. Equally valuable, equally publishable, with equivalence testing.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Science Without Spin
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AI writes the papers. Humans do the science and the reviewing.
            Pre-registered designs ensure findings are reported faithfully —
            positive, negative, or null. Not AI ghostwriting — a controlled,
            auditable pipeline where every step is transparent.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard/submissions/new">
                Submit a Study
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://sphelps.substack.com/p/science-has-a-slop-problem-ai-didnt" target="_blank" rel="noopener noreferrer">
                Read the Manifesto
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            A fully audited pipeline from hypothesis to publication — every
            step logged and visible — with AI handling the write-up so
            researchers can focus on what matters.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-5">
            {workflowSteps.map((step) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Types */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Study Types
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Purpose-built templates for different research methodologies, each
            with appropriate pre-registration requirements.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {studyTypes.map((type) => (
              <Card key={type.title}>
                <CardHeader>
                  <type.icon className="h-8 w-8 text-primary" />
                  <CardTitle className="mt-2">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container mx-auto px-4 py-20 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Ready to publish — or review — without bias?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            AI is already writing papers behind closed doors. The choice is
            between opaque AI ghostwriting and transparent, auditable AI
            authorship. Join researchers building the alternative.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/dashboard/submissions/new">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
