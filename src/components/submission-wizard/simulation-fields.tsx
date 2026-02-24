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

interface SimulationFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export function SimulationFields({ form }: SimulationFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="aims"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Aims</FormLabel>
            <FormDescription>
              What question does this simulation study answer?
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
        name="dataGeneratingMechanisms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data-Generating Mechanisms</FormLabel>
            <FormDescription>
              Describe how simulated data will be generated (distributions, parameters, dependencies).
            </FormDescription>
            <FormControl>
              <Textarea rows={5} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estimands"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimands</FormLabel>
            <FormDescription>
              What quantities are methods trying to estimate?
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
        name="methods"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Methods</FormLabel>
            <FormDescription>
              What methods will be compared?
            </FormDescription>
            <FormControl>
              <Textarea rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="performanceMeasures"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Performance Measures</FormLabel>
            <FormDescription>
              e.g. bias, variance, MSE, coverage, type I error, power
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
        name="simulationParameters"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Simulation Parameters</FormLabel>
            <FormDescription>
              Describe parameter ranges and scenarios to be explored.
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
        name="numberOfReplications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Replications</FormLabel>
            <FormControl>
              <Input placeholder="e.g. 1000 per scenario" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="softwareEnvironment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Software Environment (optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g. R 4.3.1, Python 3.11" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
