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

interface ReplicationFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export function ReplicationFields({ form }: ReplicationFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Original Study</h4>
        <FormField
          control={form.control}
          name="originalStudy.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title of the original study" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="originalStudy.authors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authors</FormLabel>
              <FormControl>
                <Input placeholder="Authors of the original study" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="originalStudy.doi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DOI (optional)</FormLabel>
              <FormControl>
                <Input placeholder="10.xxxx/xxxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="originalStudy.keyFindings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Findings to Replicate</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Summarize the key findings you intend to replicate"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="replicationDesign"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Replication Design</FormLabel>
            <FormDescription>
              How will you replicate the original study? Direct or conceptual replication?
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
        name="deviations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Planned Deviations (optional)</FormLabel>
            <FormDescription>
              Any intentional differences from the original protocol.
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
        name="successCriteria"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Success Criteria</FormLabel>
            <FormDescription>
              How will you determine if the replication was successful?
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
        name="powerAnalysis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Power Analysis</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Describe your power analysis and target sample size"
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
