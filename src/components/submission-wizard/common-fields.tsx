"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CommonFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export function CommonFields({ form }: CommonFieldsProps) {
  const [keywordsText, setKeywordsText] = useState<string>(
    () => form.getValues("keywords")?.join(", ") ?? ""
  );

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Study Title</FormLabel>
            <FormControl>
              <Input
                placeholder="A descriptive title for your study"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="researchQuestion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Research Question</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What is the primary research question this study aims to answer?"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="background"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Background & Motivation</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide context for why this research is important and what gap it addresses."
                rows={5}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="keywords"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Keywords (optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. machine learning, clinical trials, bayesian inference"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                onBlur={() => {
                  const parsed = keywordsText
                    .split(",")
                    .map((k: string) => k.trim())
                    .filter(Boolean);
                  field.onChange(parsed);
                }}
              />
            </FormControl>
            <FormDescription>Comma-separated</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
