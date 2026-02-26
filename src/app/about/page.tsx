import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">About</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Rethinking how scientific findings are reported and published.
      </p>

      <Separator className="my-8" />

      <div className="prose prose-neutral max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold">The Problem</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Scientific publishing suffers from systemic bias. Career incentives
            drive researchers to p-hack, spin results, and bury negative
            findings. Journals prefer novel, positive results, creating a
            distorted picture of scientific knowledge. The replication crisis is
            a symptom; the incentive structure is the disease. Now AI
            ghostwriting is compounding the problem — researchers increasingly
            use large language models to draft papers without disclosure, adding
            another layer of opacity to a system already short on transparency.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">The Insight</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            AI is already writing scientific papers — the question is no longer
            whether to use it, but whether to use it transparently. Behind
            closed doors, researchers prompt language models to draft manuscripts
            with no audit trail and no accountability. This platform takes the
            opposite approach: a fully audited pipeline where every step from
            pre-registration to final publication is logged and visible. AI has
            no career to advance, no tenure case to build, no grant to win.
            Given a pre-registered design and raw results, it reports what was
            found — positive, negative, or null — without narrative spin. This
            frees human researchers to focus on what they do best: designing
            studies, interpreting significance, and critically reviewing
            methodology.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">The Process</h2>
          <div className="mt-4 grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pre-registration</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Researchers submit their study design, hypotheses, and analysis
                plan before data collection. This is the contract that the AI
                will write against — deviations are flagged, not hidden.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI-Authored Write-up</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                The AI generates a paper section-by-section, grounded in the
                pre-registration and submitted results. It reports faithfully:
                effect sizes, confidence intervals, and what the data actually
                shows — not what the researcher hoped to find.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Open Peer Review</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Human experts review the methodology, analysis, and
                interpretation. Reviews are published alongside the paper as
                attributed, citable contributions — reviewers build a public
                track record of impact, not just authors. The AI editor manages
                the workflow, matches reviewers, and compiles editorial
                recommendations.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Transparent Publication</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Published articles include the full chain: pre-registration,
                results, AI-generated paper, peer reviews, and editorial
                reasoning. The entire generation process is logged — every
                prompt, model version, and editorial decision forms part of
                a permanent audit trail published alongside the paper. Nothing
                is hidden.
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Principles</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <strong>Results-blind evaluation:</strong> Study design is assessed
              before results are known.
            </li>
            <li>
              <strong>Faithful reporting:</strong> AI reports what was found, not
              what was hoped for.
            </li>
            <li>
              <strong>Negative results welcome:</strong> Null findings are
              published with the same rigour as positive ones.
            </li>
            <li>
              <strong>Full transparency:</strong> Pre-registrations, data,
              reviews, and editorial decisions are all public.
            </li>
            <li>
              <strong>Human oversight:</strong> AI writes; humans design, review,
              and decide. Reviewers are recognised as equal contributors to the
              scientific record.
            </li>
            <li>
              <strong>Audited pipeline:</strong> Every step — from
              pre-registration through generation to editorial decision — is
              logged and published. The process is the proof.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
