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

interface NegativeResultsFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export function NegativeResultsFields({ form }: NegativeResultsFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="hypotheses"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Original Hypotheses</FormLabel>
            <FormDescription>
              State the hypotheses that were not supported.
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
              <Textarea rows={3} {...field} />
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
              <Input {...field} />
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
              <Textarea rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="equivalenceBounds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Equivalence Bounds</FormLabel>
            <FormDescription>
              Specify the smallest effect size of interest (SESOI) and equivalence bounds.
            </FormDescription>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="equivalenceTest"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Equivalence Testing Approach</FormLabel>
            <FormDescription>
              e.g. TOST (Two One-Sided Tests), Bayesian evidence for null
            </FormDescription>
            <FormControl>
              <Textarea rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="powerForEquivalence"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Power Analysis for Equivalence</FormLabel>
            <FormControl>
              <Textarea
                rows={2}
                placeholder="Describe power analysis for the equivalence test"
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
