"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface EmpiricalFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export function EmpiricalFields({ form }: EmpiricalFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="hypotheses"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hypotheses</FormLabel>
            <FormDescription>
              State each hypothesis clearly. Specify direction of effects where applicable.
            </FormDescription>
            <FormControl>
              <Textarea rows={4} placeholder="H1: ..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="design"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Study Design</FormLabel>
            <FormDescription>
              e.g. between-subjects 2x3 factorial, within-subjects repeated measures
            </FormDescription>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="samplingPlan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sampling Plan</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="How will participants / observations be recruited or sampled?"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sampleSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sample Size & Justification</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. N=200 based on power analysis (d=0.4, alpha=0.05, power=0.80)"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Variables</h4>
        <FormField
          control={form.control}
          name="variables.independent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Independent Variables</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="variables.dependent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dependent Variables</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="variables.covariates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Covariates (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="analysisPlan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Analysis Plan</FormLabel>
            <FormControl>
              <Textarea
                rows={4}
                placeholder="Describe the planned analyses in detail"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="statisticalTests"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Statistical Tests</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. Two-way ANOVA, Bayesian t-test"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="inferenceoCriteria"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Inference Criteria</FormLabel>
            <FormDescription>
              e.g. alpha=0.05, Bayes Factor thresholds, equivalence bounds
            </FormDescription>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dataExclusion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data Exclusion Criteria (optional)</FormLabel>
            <FormControl>
              <Textarea
                rows={2}
                placeholder="Describe criteria for excluding data points or participants"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="missingData"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Missing Data Handling (optional)</FormLabel>
            <FormControl>
              <Textarea
                rows={2}
                placeholder="How will missing data be handled?"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
